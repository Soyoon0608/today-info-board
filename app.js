// =========================================
// 오늘의 진짜 정보판
//
// 카드 1
// 실제 공개 데이터 조회
//
// 카드 2
// API Key 없는 공개 API 사용
//
// 카드 3
// 합성 fixture를 이용한 실패 재생
// =========================================


// =========================================
// 실제 공개 API
//
// API Key 없음
// 비밀번호 없음
// 개인 토큰 없음
// =========================================

const API_URL =
    "https://api.frankfurter.dev/v2/rate/USD/KRW";


// =========================================
// 실제 데이터 DOM
// =========================================

const exchangeValue =
    document.getElementById("exchangeValue");

const source =
    document.getElementById("source");

const sourceTime =
    document.getElementById("sourceTime");

const fetchedAt =
    document.getElementById("fetchedAt");

const savedValue =
    document.getElementById("savedValue");

const displayValue =
    document.getElementById("displayValue");

const rawValue =
    document.getElementById("rawValue");

const rawData =
    document.getElementById("rawData");

const liveStatus =
    document.getElementById("liveStatus");



// =========================================
// 카드 3 DOM
// =========================================

const readingStatus =
    document.getElementById("readingStatus");

const errorCode =
    document.getElementById("errorCode");

const recordCount =
    document.getElementById("recordCount");

const failureMessage =
    document.getElementById("failureMessage");

const staleBadge =
    document.getElementById("staleBadge");

const lastKnownGoodValue =
    document.getElementById(
        "lastKnownGoodValue"
    );

const lastKnownGoodDate =
    document.getElementById(
        "lastKnownGoodDate"
    );

const nextAction =
    document.getElementById("nextAction");

const retryButton =
    document.getElementById("retryButton");

const resetReplay =
    document.getElementById("resetReplay");

const dailyHistory =
    document.getElementById("dailyHistory");



// =========================================
// 실제 데이터 날짜
// KST 표시
// =========================================

function formatKST(date) {

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            timeZone:
                "Asia/Seoul",

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit",

            hour12:
                false
        }
    ).format(date);

}



// =========================================
// 실제 환율 조회
// =========================================

async function loadExchangeRate() {

    try {

        liveStatus.textContent =
            "실제 데이터 조회 중";


        liveStatus.classList.remove(
            "stale"
        );


        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                `HTTP 오류: ${response.status}`
            );

        }


        const data =
            await response.json();


        // v2 응답 형식 확인
        if (
            !data ||
            typeof data.rate !== "number"
        ) {

            throw new Error(
                "예상한 데이터 형식이 아닙니다."
            );

        }


        const rate =
            data.rate;


        const now =
            new Date();


        const formattedRate =
            rate.toLocaleString(
                "ko-KR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


        // 정상 데이터 저장
        const normalRecord = {

            value: rate,

            formattedValue:
                `${formattedRate} KRW`,

            unit:
                "KRW per 1 USD",

            source:
                "Frankfurter 공개 환율 API",

            sourceTime:
                data.date,

            fetchedAt:
                now.toISOString(),

            timezone:
                "Asia/Seoul (KST)",

            rawData:
                data

        };


        localStorage.setItem(
            "lastKnownGood",
            JSON.stringify(
                normalRecord
            )
        );


        // 화면 표시

        exchangeValue.textContent =
            formattedRate;


        rawValue.textContent =
            `${formattedRate} KRW`;


        savedValue.textContent =
            normalRecord.formattedValue;


        displayValue.textContent =
            normalRecord.formattedValue;


        source.textContent =
            normalRecord.source;


        sourceTime.textContent =
            `${data.date} (출처 기준 날짜)`;


        fetchedAt.textContent =
            `${formatKST(now)} KST`;


        rawData.textContent =
            JSON.stringify(
                data,
                null,
                2
            );


        liveStatus.textContent =
            "실제 데이터 정상";


        console.log(
            "실제 공개 데이터 조회 성공:",
            data
        );


    } catch (error) {

        console.error(
            "실제 데이터 조회 실패:",
            error
        );


        loadLastKnownGood();

    }

}



// =========================================
// 실제 데이터 실패 시
// 마지막 정상값 표시
// =========================================

function loadLastKnownGood() {

    const saved =
        localStorage.getItem(
            "lastKnownGood"
        );


    liveStatus.textContent =
        "현재 조회 실패 · 마지막 정상값";


    liveStatus.classList.add(
        "stale"
    );


    if (!saved) {

        exchangeValue.textContent =
            "-";


        rawValue.textContent =
            "-";


        savedValue.textContent =
            "저장된 정상값 없음";


        displayValue.textContent =
            "-";


        source.textContent =
            "현재 조회 실패";


        sourceTime.textContent =
            "-";


        fetchedAt.textContent =
            `${formatKST(
                new Date()
            )} KST`;


        rawData.textContent =
            "현재 데이터를 가져오지 못했고 저장된 정상값도 없습니다.";


        return;

    }


    const data =
        JSON.parse(saved);


    const formattedRate =
        data.value.toLocaleString(
            "ko-KR",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        );


    exchangeValue.textContent =
        formattedRate;


    rawValue.textContent =
        `${formattedRate} KRW`;


    savedValue.textContent =
        data.formattedValue;


    displayValue.textContent =
        data.formattedValue;


    source.textContent =
        data.source;


    sourceTime.textContent =
        data.sourceTime;


    fetchedAt.textContent =
        `${formatKST(
            new Date(
                data.fetchedAt
            )
        )} KST`;


    rawData.textContent =
        JSON.stringify(
            data.rawData,
            null,
            2
        );

}



// =========================================
// 카드 3
// 합성 fixture
//
// 실제 데이터와 분리된 시험 데이터
// =========================================

const fixtures = {

    // -------------------------------------
    // 같은 실제 날짜의 첫 번째 정상값
    // -------------------------------------

    "T04-NORMAL-D1-A": {

        type:
            "success",

        recordDate:
            "2026-08-24",

        value:
            100,

        unit:
            "synthetic-unit"

    },


    // -------------------------------------
    // 같은 날짜의 두 번째 정상값
    // 기존 행 갱신
    // -------------------------------------

    "T04-NORMAL-D1-B": {

        type:
            "success",

        recordDate:
            "2026-08-24",

        value:
            105,

        unit:
            "synthetic-unit"

    },


    // -------------------------------------
    // 다음 날짜 정상값
    // -------------------------------------

    "T04-NORMAL-D2": {

        type:
            "success",

        recordDate:
            "2026-08-25",

        value:
            120,

        unit:
            "synthetic-unit"

    },


    // -------------------------------------
    // 느린 외부 응답
    // -------------------------------------

    "T04-TIMEOUT": {

        type:
            "error",

        errorCode:
            "timeout",

        title:
            "외부 응답이 너무 오래 걸리고 있습니다.",

        action:
            "잠시 기다린 후 다시 시도하세요."

    },


    // -------------------------------------
    // 외부 원천 401
    // -------------------------------------

    "T04-AUTH-401": {

        type:
            "error",

        errorCode:
            "auth_401",

        title:
            "외부 데이터 원천이 요청을 거절했습니다.",

        action:
            "외부 원천의 접근 상태를 확인한 후 다시 시도하세요."

    },


    // -------------------------------------
    // 호출 제한
    // -------------------------------------

    "T04-RATE-429": {

        type:
            "error",

        errorCode:
            "rate_429",

        title:
            "외부 원천의 호출 제한에 도달했습니다.",

        action:
            "호출 제한이 해제될 때까지 기다린 후 다시 시도하세요."

    },


    // -------------------------------------
    // 오프라인
    // -------------------------------------

    "T04-OFFLINE": {

        type:
            "error",

        errorCode:
            "offline",

        title:
            "현재 네트워크 연결을 사용할 수 없습니다.",

        action:
            "인터넷 연결을 확인한 후 다시 시도하세요."

    },


    // -------------------------------------
    // 응답 형식 변경
    // -------------------------------------

    "T04-SCHEMA-BREAK": {

        type:
            "error",

        errorCode:
            "schema_break",

        title:
            "외부 데이터의 응답 형식이 예상과 다릅니다.",

        action:
            "외부 데이터 형식이 정상으로 복구된 후 다시 시도하세요."

    },


    // -------------------------------------
    // 복구 fixture
    // -------------------------------------

    "T04-RECOVER-D2": {

        type:
            "success",

        recordDate:
            "2026-08-25",

        value:
            120,

        unit:
            "synthetic-unit"

    }

};



// =========================================
// 합성 상태 불러오기
// =========================================

function getReplayState() {

    const saved =
        localStorage.getItem(
            "t04SyntheticReplayState"
        );


    if (saved) {

        try {

            return JSON.parse(
                saved
            );

        } catch (error) {

            console.error(
                "합성 상태 복원 실패:",
                error
            );

        }

    }


    return {

        status:
            "fresh",

        errorCode:
            "none",

        records:
            [],

        lastKnownGood:
            null,

        pendingRecovery:
            false

    };

}



// =========================================
// 합성 상태 저장
// =========================================

function saveReplayState(state) {

    localStorage.setItem(
        "t04SyntheticReplayState",

        JSON.stringify(
            state
        )
    );

}



// =========================================
// 일별 기록 저장
//
// 같은 날짜:
// 새 행 추가 X
// 기존 값 갱신
//
// 다른 날짜:
// 정확히 한 건 추가
// =========================================

function saveDailyRecord(
    state,
    fixture
) {

    const existingIndex =
        state.records.findIndex(

            record =>

                record.recordDate ===
                fixture.recordDate

        );


    const newRecord = {

        recordDate:
            fixture.recordDate,

        value:
            fixture.value,

        unit:
            fixture.unit

    };


    // 같은 날짜

    if (
        existingIndex !== -1
    ) {

        state.records[
            existingIndex
        ] = newRecord;

    }

    // 다른 날짜

    else {

        state.records.push(
            newRecord
        );

    }


    // 마지막 정상값 갱신

    state.lastKnownGood =
        newRecord;

}



// =========================================
// fixture 재생
// =========================================

function replayFixture(
    fixtureName
) {

    const fixture =
        fixtures[
            fixtureName
        ];


    if (!fixture) {

        return;

    }


    const state =
        getReplayState();



    // =====================================
    // 정상
    // =====================================

    if (
        fixture.type ===
        "success"
    ) {

        saveDailyRecord(
            state,
            fixture
        );


        state.status =
            "fresh";


        state.errorCode =
            "none";


        state.pendingRecovery =
            false;


        saveReplayState(
            state
        );


        renderReplayState(
            state
        );


        return;

    }



    // =====================================
    // 실패
    // =====================================

    state.status =
        "stale";


    state.errorCode =
        fixture.errorCode;


    // 실패 시
    // 마지막 정상값 삭제 금지

    // 실패 시
    // 기존 일별 기록 삭제 금지

    state.pendingRecovery =
        true;


    saveReplayState(
        state
    );


    renderReplayState(
        state,
        fixture
    );

}



// =========================================
// 합성 상태 화면 표시
// =========================================

function renderReplayState(
    state,
    currentFixture = null
) {

    // -------------------------------------
    // 상태
    // -------------------------------------

    readingStatus.textContent =
        state.status;


    errorCode.textContent =
        state.errorCode;


    recordCount.textContent =
        `${state.records.length}건`;



    // -------------------------------------
    // 마지막 정상값
    // -------------------------------------

    if (
        state.lastKnownGood
    ) {

        lastKnownGoodValue.textContent =
            `${state.lastKnownGood.value} ${state.lastKnownGood.unit}`;


        lastKnownGoodDate.textContent =
            state.lastKnownGood.recordDate;

    }

    else {

        lastKnownGoodValue.textContent =
            "정상 데이터를 아직 불러오지 않았습니다.";


        lastKnownGoodDate.textContent =
            "-";

    }



    // -------------------------------------
    // STALE 상태
    // -------------------------------------

    if (
        state.status ===
        "stale"
    ) {

        staleBadge.textContent =
            "STALE · 오래된 정상값";


        staleBadge.classList.add(
            "stale"
        );


        failureMessage.classList.add(
            "error"
        );


        if (
            currentFixture
        ) {

            failureMessage.innerHTML =
                `
                <strong>
                    ${currentFixture.title}
                </strong>

                <p>
                    마지막 정상값은 삭제하지 않고 유지합니다.
                    현재 화면의 데이터 상태는 오래된 값(STALE)입니다.
                </p>
                `;


            nextAction.textContent =
                currentFixture.action;

        }


        retryButton.disabled =
            false;

    }



    // -------------------------------------
    // FRESH 상태
    // -------------------------------------

    else {

        staleBadge.textContent =
            "FRESH";


        staleBadge.classList.remove(
            "stale"
        );


        failureMessage.classList.remove(
            "error"
        );


        failureMessage.innerHTML =
            `
            <strong>
                정상 상태입니다.
            </strong>

            <p>
                현재 합성 데이터가 정상적으로 처리되었습니다.
            </p>
            `;


        nextAction.textContent =
            "현재 데이터 상태가 정상입니다.";


        retryButton.disabled =
            true;

    }



    // -------------------------------------
    // 일별 기록
    // -------------------------------------

    if (
        state.records.length === 0
    ) {

        dailyHistory.innerHTML =
            `
            <p class="empty-history">
                아직 합성 기록이 없습니다.
            </p>
            `;


        return;

    }


    dailyHistory.innerHTML =
        state.records
            .map(

                record =>

                    `
                    <div class="history-item">

                        <span>
                            ${record.recordDate}
                        </span>

                        <span class="history-value">
                            ${record.value}
                            ${record.unit}
                        </span>

                    </div>
                    `

            )
            .join("");

}



// =========================================
// 다시 시도
//
// 실패 후 recover-d2 재생
// =========================================

retryButton.addEventListener(

    "click",

    () => {

        const state =
            getReplayState();


        if (
            !state.pendingRecovery
        ) {

            return;

        }


        replayFixture(
            "T04-RECOVER-D2"
        );

    }

);



// =========================================
// 합성 테스트 초기화
// =========================================

resetReplay.addEventListener(

    "click",

    () => {

        localStorage.removeItem(
            "t04SyntheticReplayState"
        );


        const initialState =
            getReplayState();


        renderReplayState(
            initialState
        );

    }

);



// =========================================
// fixture 버튼
// =========================================

document
    .querySelectorAll(
        "[data-fixture]"
    )
    .forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    replayFixture(
                        button.dataset.fixture
                    );

                }

            );

        }

    );



// =========================================
// 시작
// =========================================

renderReplayState(
    getReplayState()
);


loadExchangeRate();
