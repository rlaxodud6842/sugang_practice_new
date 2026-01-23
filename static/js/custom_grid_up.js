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
            <td><button type="button" class="btn-apply" onclick="deleteLecture('${item.SUGANG_NO}')">신청</button></td>
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
    list = list.filter(i => i.SUGANG_NO !== code);
    localStorage.setItem('custom_lecture_data', JSON.stringify(list));
    renderGrid();
}

// ... (기존 window.handleFastApply 등 함수 정의 코드 뒤에 추가)

// 1. 강제 호출
window.renderGrid();

// 2. 만약의 경우를 대비해 jQuery가 있다면 한번 더 호출
if (window.jQuery) {
    $(document).ready(function () {
        window.renderGrid();
    });
}