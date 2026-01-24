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
window.handleFastApply = function () {
    const codeInput = document.getElementById('pGwamokCd');
    const inputCode = codeInput.value.trim(); // 입력된 값 (예: '2026', '7777' 등)

    // 1. 유효성 검사 (숫자만, 최대 4자리)
    const isNumeric = /^[0-9]+$/.test(inputCode); // 숫자 체크 정규식

    if (!inputCode) {
        alert("수강번호를 입력해주세요.");
        codeInput.focus();
        return;
    }

    if (!isNumeric) {
        alert("수강번호는 숫자만 입력 가능합니다.");
        codeInput.value = "";
        codeInput.focus();
        return;
    }

    if (inputCode.length > 4) {
        alert("수강번호는 최대 4자리까지만 입력 가능합니다.");
        codeInput.focus();
        return;
    }

    if (!inputCode) {
        alert("수강번호를 입력해주세요.");
        codeInput.focus();
        return;
    }

    // 1. 중복 체크 (수강번호 중복)
    let list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");
    if (list.some(i => i.SUGANG_NO === inputCode)) {
        alert("이미 신청된 수강번호입니다.");
        return;
    }

    // 2. 입력된 번호에 매칭할 랜덤 과목명 생성 (MZ 테마)
    const randomCourse = courseDB[Math.floor(Math.random() * courseDB.length)];
    const timeInfo = generateRandomTime(); // 요일/시간 생성

    if (!confirm(`[수강번호 : ${inputCode}] 과목을 신청하시겠습니까?`)) {
        return; // '취소' 클릭 시 함수 종료
    }

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
        alert(`🚨 시간표 충돌!\n새 과목 시간: ${timeInfo.text}\n다른 번호를 입력하거나 다시 시도하세요.`);
        return;
    }

    // 4. 입력값 기반 데이터 객체 생성
    const newItem = {
        SUGANG_NO: inputCode,         // ★ 사용자가 입력한 값을 그대로 사용
        GWAMOK_NM: randomCourse.name, // 이름은 힙하게 랜덤 배정
        HAKSU_GBN: "전공",
        GYO_GBN_NM: "전선",
        HAKJUM: "3",
        GWAMOK_GBN: "주",
        SIGAN_CONT: timeInfo.text,
        BOK1: "N", BOK2: "N", BU: "N",
        DF_FG: "01",
        RE_SUGANG: "N",
        TRANS_YN: "N"
    };

    // 5. 저장 및 갱신
    list.push(newItem);
    localStorage.setItem('custom_lecture_data', JSON.stringify(list));

    if (typeof window.renderGrid === 'function') window.renderGrid();

    alert("수강신청이 성공적으로 저장되었습니다!")

    // 6. 입력창 초기화
    codeInput.value = "";
    codeInput.focus();
};
// 1. 데이터 화면 출력 함수 (customgrid_1.0 스타일)
window.renderGrid = function () {
    const data = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");
    const tbody = document.getElementById('lectureBody');
    if (!tbody) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="14" style="background:#fff; height:60px; text-align:center;">내역이 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr>
            <td><button type="button" class="btn-sub btn-mode" onclick="deleteLecture('${item.SUGANG_NO}')">삭제</button></td>
            <td>${item.HAKSU_GBN || '전공'}</td> <td><button type="button" class="btn-sm is-blue-dark" style = "cursor:pointer;color:#fff;font-weight:bold;font-size:11px;">${item.SUGANG_NO}</button></td> <td>${item.GYO_GBN_NM || '전필'}</td> <td class="text-left" title="${item.GWAMOK_NM}">${item.GWAMOK_NM}</td> <td>${item.HAKJUM || '3'}</td> <td>${item.GWAMOK_GBN || '주'}</td> <td class="text-left">${item.SIGAN_CONT || ''}</td> <td>${item.BOK1 || ''}</td> <td>${item.BOK2 || ''}</td> 
            <td>${item.BU || ''}</td>   <td>${item.DF_FG || '01'}</td> <td>${item.RE_SUGANG || 'N'}</td> <td>${item.TRANS_YN || 'N'}</td> </tr>
    `).join('');
};
// 2. 버튼 클릭 시 실행될 함수
function handleFastApply() {
    const codeInput = document.getElementById('pGwamokCd');
    const code = codeInput.value.trim();

    if (code.length !== 4) {
        alert("수강번호 4자리를 입력해주세요.");
        return;
    }

    // 데이터 생성
    const newItem = {
        SUGANG_NO: code,
        GWAMOK_NM: "신규 등록 과목",
        HAKSU_GBN: "전공", HAKNYUN: "1", GWAMOK_GBN: "주", GYO_GBN_NM: "일반",
        HAKJUM: "3", PROF_NM: "담당교수", SIGAN_CONT: "시간미정", DAESANG_HAKGWA: "전체",
        JEHAN_INWON: "99", BOK1: "", BOK2: "", BU: "", DF_FG: "01", RE_SUGANG: "N", TRANS_YN: "N"
    };

    // 로컬 스토리지 저장
    let list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");
    if (list.some(i => i.SUGANG_NO === code)) {
        alert("이미 신청된 번호입니다.");
        return;
    }

    list.push(newItem);
    localStorage.setItem('custom_lecture_data', JSON.stringify(list));

    // 그리드 갱신
    renderGrid();
    codeInput.value = "";
    codeInput.focus();
}

// 3. 삭제 함수
function deleteLecture(code) {
    let list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");
    if (!confirm(`[수강번호 : ${code}]  과목을 삭제 하시겠습니까?`)) {
        return; // '취소' 클릭 시 함수 종료
    }
    list = list.filter(i => i.SUGANG_NO !== code);
    localStorage.setItem('custom_lecture_data', JSON.stringify(list));
    renderGrid();
}

window.applyFromFixed = function (code, name, gubun, isu, time, bunban) {
    // 1. 신청 의사 확인

    // 1. 전달받은 인자로 데이터 객체 생성
    const newItem = {
        SUGANG_NO: code,
        GWAMOK_NM: name,
        HAKSU_GBN: gubun,      // 구분
        GYO_GBN_NM: isu,       // 이수구분
        HAKJUM: "3",           // 기본값 (필요시 인자로 추가 가능)
        GWAMOK_GBN: "주",       // 주야
        SIGAN_CONT: time,      // 강의시간
        BOK1: "N", BOK2: "N", BU: "N",
        DF_FG: bunban,         // 분반
        RE_SUGANG: "N",
        TRANS_YN: "N"
    };

    // 2. 로컬 스토리지 저장 로직
    let list = JSON.parse(localStorage.getItem('custom_lecture_data') || "[]");

    if (list.some(i => i.SUGANG_NO === code)) {
        alert("이미 하단 리스트에 신청된 과목입니다.");
        return;
    }

    list.push(newItem);
    localStorage.setItem('custom_lecture_data', JSON.stringify(list));

    alert("수강신청이 성공적으로 저장되었습니다!")

    // 3. 하단 커스텀 그리드 갱신
    if (typeof window.renderGrid === 'function') {
        window.renderGrid();
    }
};



// ... (기존 window.handleFastApply 등 함수 정의 코드 뒤에 추가)

// 1. 강제 호출
window.renderGrid();

// 2. 만약의 경우를 대비해 jQuery가 있다면 한번 더 호출
if (window.jQuery) {
    $(document).ready(function () {
        window.renderGrid();
    });
}

