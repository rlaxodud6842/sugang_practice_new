const mzDesserts = [
    "두쫀쿠", "두바이 초콜릿", "요아정(요거트)", "망고 사고", "카다이프", "피스타치오", "푸딩 푸딩",
    "탕후루", "크루키", "약과 쿠키", "소금빵", "버터바", "황치즈 케이크", "까눌레", "휘낭시에",
    "쪽파 크림치즈 베이글", "망고 빙수", "구슬 아이스크림", "코코아 밤", "찹쌀떡 아이스",
    "멜론 소다", "버터 맥주 케이크", "생망고 케이크", "빨간 맛 푸딩", "초당 옥수수 타르트"
];

const mzSubjects = [
    "정제 공학", "결정 구조학", "분자 미학", "유체 역학", "표면 장력론", "당도 최적화론",
    "열역학 실습", "식감 설계학", "시각적 해체주의", "브랜딩 심리학", "수율 계산학",
    "동결 건조 제어", "점성 분석", "삼투압 실험", "탄성 계수 측정"
];


const courseDB = [];
for (let i = 1; i <= 50; i++) {
    const dessert = mzDesserts[i % mzDesserts.length];
    const subject = mzSubjects[i % mzSubjects.length];
    courseDB.push({
        code: (2000 + i).toString(), // MZ 코드는 2000번대부터
        name: `${dessert} ${subject}`,
        isu: i % 4 === 0 ? "전필" : "전선",
        gubun: "전공"
    });
}

// 랜덤 시간 생성기 (월~금, 지정된 타임슬롯)
function generateRandomTime() {
    // 1. 대학에서 흔히 쓰이는 요일 패턴 (단일 요일 + 복수 요일)
    const patterns = [
        "월,수", "월,수", "금", // 주 2회 세트
    ];

    // 2. 표준 강의 타임슬롯
    const slots = [
        { start: "09:00", end: "10:15" },
        { start: "10:30", end: "11:45" },
        { start: "13:30", end: "14:45" },
        { start: "15:00", end: "16:15" },
        { start: "16:30", end: "17:45" }
    ];

    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const slot = slots[Math.floor(Math.random() * slots.length)];

    // 3. 중복 체크 로직(timeToMin 등)이 인식할 수 있도록 텍스트 포맷 구성
    return {
        day: pattern, // "월,수" 형태로 반환
        start: slot.start,
        end: slot.end,
        text: `${pattern}(${slot.start}∼${slot.end})`
    };
}

// 시간을 분 단위 숫자로 변환 (예: "13:30" -> 810)
function timeToMin(timeStr) {
    const [hh, mm] = timeStr.split(':').map(Number);
    return hh * 60 + mm;
}

window.handleFastApply = async function() {
    const codeInput = document.getElementById('pGwamokCd');
    const inputCode = codeInput.value.trim(); // 입력된 값 (예: '2026', '7777' 등)

    // 1. 유효성 검사 (숫자만, 최대 4자리)
    const isNumeric = /^[0-9]+$/.test(inputCode); // 숫자 체크 정규식

    // 1. 필수 입력 체크
    if (!inputCode) {
        await CustomModal.show("수강번호를 입력해주세요.");
        inputElement.focus();
        return;
    }

    // 2. 숫자 형식 체크
    if (!isNumeric) {
        await CustomModal.show("수강번호는 숫자만 입력 가능합니다.");
        inputElement.value = ""; // clear: true 로직
        inputElement.focus();
        return;
    }

    // 3. 길이 체크
    if (inputCode.length > 4) {
        await CustomModal.show("수강번호는 최대 4자리까지만 입력 가능합니다.");
        inputElement.focus();
        return;
    }

    // 4. 중복 체크
    let list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");
    if (list.some(i => i.SUGANG_NO === inputCode)) {
        await CustomModal.show("이미 신청된 수강번호입니다.");
        inputElement.focus();
        return;
    }


    // 2. 입력된 번호에 매칭할 랜덤 과목명 생성 (MZ 테마)
    const randomCourse = courseDB[Math.floor(Math.random() * courseDB.length)];
    const timeInfo = generateRandomTime(); // 요일/시간 생성

    // 3. 시간대 중복 정밀 체크
    const isOverlapped = list.some(i => {
        const reg = /^(.*)\((.*)∼(.*)\)$/;
        const match = i.SIGAN_CONT ? i.SIGAN_CONT.match(reg) : null;
        if (match) {
            const [_, existDayStr, existStartStr, existEndStr] = match;
            const newDays = timeInfo.day.split(',');
            const existDays = existDayStr.split(',');
            const dayMatch = newDays.some(d => existDays.includes(d));

            if (dayMatch) {
                const newS = timeToMin(timeInfo.start);
                const newE = timeToMin(timeInfo.end);
                const exS = timeToMin(existStartStr);
                const exE = timeToMin(existEndStr);
                return (newS < exE && newE > exS);
            }
        }
        return false;
    });

    if (isOverlapped) {
        await CustomModal.show(`🚨 시간표 충돌!\n새 과목 시간: ${timeInfo.text}\n다른 번호를 입력하거나 다시 시도하세요.`);
        return;
    }

    // 4. 입력값 기반 데이터 객체 생성
    const newItem = {
        SUGANG_NO: inputCode, // ★ 사용자가 입력한 값을 그대로 사용
        GWAMOK_NM: randomCourse.name, // 이름은 힙하게 랜덤 배정
        HAKSU_GBN: "전공",
        GYO_GBN_NM: "전선",
        HAKJUM: "3",
        GWAMOK_GBN: "주",
        SIGAN_CONT: timeInfo.text,
        BOK1: "",
        BOK2: "",
        BU: "",
        DF_FG: "",
        RE_SUGANG: "",
        TRANS_YN: ""
    };

    // 5. 저장 및 갱신
    list.push(newItem);
    localStorage.setItem('custom_lecture_data', JSON.stringify(list));

    if (typeof window.renderGrid === 'function') {
        window.updateGridCount();
        window.updateGridStats();
        window.renderGrid();
    }
    await CustomModal.show(`저장되었습니다!`);

    // 6. 입력창 초기화
    codeInput.value = "";
    codeInput.focus();
};
// 1. 데이터 화면 출력 함수 (customgrid_1.0 스타일)
window.renderGrid = function() {
    const data = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");
    const tbody = document.getElementById('lectureBody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="14" style="background:#fff; height:60px; text-align:center;">내역이 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td><button type="button" class="btn-sub btn-mode" onclick="deleteLecture('${item.SUGANG_NO}', '${item.GWAMOK_NM}')">삭제</button></td>
            <td>${item.HAKSU_GBN || '전공'}</td> <td><button type="button" class="btn-sm is-blue-dark" style = "cursor:pointer;color:#fff;font-weight:bold;font-size:11px;">${item.SUGANG_NO}</button></td> <td>${item.GYO_GBN_NM || '전필'}</td> <td class="text-left" title="${item.GWAMOK_NM}">${item.GWAMOK_NM}</td> <td>${item.HAKJUM || '3'}</td> <td>${item.GWAMOK_GBN || '주'}</td> <td class="text-left">${item.SIGAN_CONT || ''}</td> <td>${item.BOK1 || ''}</td> <td>${item.BOK2 || ''}</td> 
            <td>${item.BU || ''}</td>   <td>${item.DF_FG || ''}</td> <td>${item.RE_SUGANG || ''}</td> <td>${item.TRANS_YN || ''}</td> </tr>
    `).join('');

    window.updateGridCount();
    window.updateGridStats();

};

// 3. 삭제 함수
async function deleteLecture(code, name) {
    let list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");

    const result = await CustomModal.show(`${name}<br>과목을 삭제 하시겠습니까?`, 'confirm');

    // 2. 사용자가 '확인'을 눌렀을 때만 삭제 로직 실행
    if (result) {
        let list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");

        list = list.filter(i => i.SUGANG_NO !== code);
        localStorage.setItem('custom_lecture_data', JSON.stringify(list));

        // 3. 그리드 및 통계 갱신
        window.updateGridCount();
        window.updateGridStats();
        renderGrid();

        // (선택사항) 삭제 완료 알림
        await CustomModal.show("삭제되었습니다!");
    }
}

window.applyFromFixed = async function(code, name, gubun, isu, time) {

    // 1. 전달받은 인자로 데이터 객체 생성
    const newItem = {
        SUGANG_NO: code,
        GWAMOK_NM: name,
        HAKSU_GBN: gubun, // 구분
        GYO_GBN_NM: isu, // 이수구분
        HAKJUM: "3", // 기본값 (필요시 인자로 추가 가능)
        GWAMOK_GBN: "주", // 주야
        SIGAN_CONT: time, // 강의시간
        BOK1: "",
        BOK2: "",
        BU: "",
        DF_FG: "", // 분반
        RE_SUGANG: "",
        TRANS_YN: "N"
    };

    // 2. 로컬 스토리지 저장 로직
    let list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");


    // ★ [추가] 버튼 찾기 및 '완료' 텍스트로 교체
    // 클래스가 btn-apply 이면서 onclick 인자에 해당 code가 포함된 버튼을 찾습니다.
    const targetBtn = document.querySelector(`.btn-apply[onclick*="'${code}'"]`);

    if (targetBtn) {
        const parentTd = targetBtn.parentElement;
        // 버튼을 지우고 빨간색 텍스트 삽입
        parentTd.innerHTML = '<span style="color: red; font-weight: bold; font-size: 0.9em;">완료</span>';
    }

    if (list.some(i => i.SUGANG_NO === code)) {
        await CustomModal.show("이미 하단 리스트에 신청된 과목입니다.");
        return;
    }

    list.push(newItem);
    localStorage.setItem('custom_lecture_data', JSON.stringify(list));

    await CustomModal.show("저장되었습니다!");

    // 3. 하단 커스텀 그리드 갱신
    if (typeof window.renderGrid === 'function') {
        window.updateGridCount();
        window.updateGridStats();
        window.renderGrid();
    }
};


window.updateGridCount = function() {
    const countElement = document.getElementById('GridBasketMiniCnt');
    if (countElement) {
        // 로컬스토리지에서 데이터를 가져와 개수 확인
        const list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");
        countElement.innerText = list.length; // 숫자 업데이트
    }
};
// ... (기존 window.handleFastApply 등 함수 정의 코드 뒤에 추가)

window.updateGridStats = function() {
    // 1. 요소 가져오기
    const countElement = document.getElementById('GridBasketMiniCnt');
    const sumElement = document.getElementById('GridBasketSum');

    // 2. 로컬스토리지 데이터 가져오기
    const list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");

    // 3. 신청 과목 수 업데이트
    if (countElement) {
        countElement.innerText = list.length;
    }

    // 4. 총 학점 합산 업데이트
    if (sumElement) {
        const totalHakjum = list.reduce((acc, item) => {
            // HAKJUM 값이 문자열일 수 있으므로 숫자로 변환 (값이 없으면 0)
            const score = parseInt(item.HAKJUM) || 0;
            return acc + score;
        }, 0);

        sumElement.innerText = totalHakjum;
    }
};
const CustomModal = {
    show(message, type = 'alert') {
        return new Promise((resolve) => {
            const isConfirm = type === 'confirm';
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';

            const sizeClass = isConfirm ? 'confirm-size' : 'alert-size';
            // Confirm일 때만 아이콘과 중앙 정렬 클래스 적용
            const bodyClass = isConfirm ? 'modal-body center' : 'modal-body';
            const iconHtml = isConfirm ? `<div class="modal-icon">!</div>` : '';
            const confirmBtnClass = isConfirm ? 'confirm-btn has-divider' : 'confirm-btn';
            const cancelBtnHtml = isConfirm ? `<button class="cancel-btn">취 소</button>` : '';

            overlay.innerHTML = `
                <div class="modal-box ${sizeClass}">
                    <div class="modal-header">
                        <span class="title">알림</span>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="${bodyClass}">
                        ${iconHtml}
                        <div>${message}</div>
                    </div>
                    <div class="modal-footer">
                        <button class="${confirmBtnClass}">확 인</button>
                        ${cancelBtnHtml}
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const handleAction = (result) => {
                overlay.remove();
                resolve(result);
            };

            overlay.querySelector('.confirm-btn').onclick = () => handleAction(true);
            if (isConfirm) {
                overlay.querySelector('.cancel-btn').onclick = () => handleAction(false);
            }
            overlay.querySelector('.close-btn').onclick = () => handleAction(false);
        });
    }
};


// 1. 강제 호출
window.renderGrid();

// 2. 만약의 경우를 대비해 jQuery가 있다면 한번 더 호출
if (window.jQuery) {
    $(document).ready(function() {
        window.renderGrid();
    });
}