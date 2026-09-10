
/* =========================================================
   오늘의 진짜 정보판
   실제 공개 환율 + 실패 재생 + 실제 일별 기록
========================================================= */


/* =========================================================
   기본 설정
========================================================= */

const API_URL = "https://api.frankfurter.dev/v2/rate/USD/KRW";

const TIMEZONE = "Asia/Seoul";

const SYNTHETIC_STORAGE_KEY = "t04SyntheticReplayState";

const REAL_DAILY_STORAGE_KEY = "t05ActualDailyRecords";


/* =========================================================
   공통 DOM
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   날짜 / 시간 처리
========================================================= */

/*
   현재 시간을 KST 기준 YYYY-MM-DD로 변환
*/
function getKSTDateKey(date = new Date()) {

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const year = parts.find(
        part => part.type === "year"
    ).value;

    const month = parts.find(
        part => part.type === "month"
    ).value;

    const day = parts.find(
        part => part.type === "day"
    ).value;

    return `${year}-${month}-${day}`;
}


/*
   KST 표시용 날짜/시간
*/
function formatKST(date) {

    return new Intl.DateTimeFormat("ko-KR", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(new Date(date));

}


/*
   숫자 표시
*/
function formatNumber(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "-";
    }

    return number.toLocaleString("ko-KR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


/* =========================================================
   카드 1
   실제 공개 환율
========================================================= */

function copyExchangeRate() {
    const exchangeValue = $("exchangeValue");
    const copyButton = $("copyExchangeRate");

    if (!exchangeValue || !copyButton) {
        return;
    }

    const value = exchangeValue.textContent.trim();

    if (!value || value === "-" || value === "데이터 없음") {
        return;
    }

    navigator.clipboard.writeText(`${value} KRW`).then(() => {
        const originalText = copyButton.textContent;

        copyButton.textContent = "복사 완료!";

        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 1500);
    }).catch((error) => {
        console.error("환율 복사 실패:", error);
    });
}

async function loadExchangeRate() {

    const exchangeValue = $("exchangeValue");
    const source = $("source");
    const sourceTime = $("sourceTime");
    const fetchedAt = $("fetchedAt");
    const rawValue = $("rawValue");
    const savedValue = $("savedValue");
    const displayValue = $("displayValue");
    const rawData = $("rawData");
    const liveStatus = $("liveStatus");

    try {

        liveStatus.textContent = "실제 데이터 조회 중";

        const response = await fetch(API_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data = await response.json();


        /*
           API 응답에서 환율 확인
        */
        const rate = Number(data.rate);

        if (!Number.isFinite(rate)) {
            throw new Error(
                "환율 데이터 형식이 올바르지 않습니다."
            );
        }


        const now = new Date();

        const formattedRate = formatNumber(rate);


        /*
           실제 정상 데이터
        */
        const normalRecord = {

            recordDate: getKSTDateKey(now),

            value: rate,

            formattedValue:
                `${formattedRate} KRW`,

            unit:
                "KRW per 1 USD",

            source:
                "Frankfurter 공개 환율 API",

            sourceUrl:
                API_URL,

            sourceTime:
                data.date || "-",

            fetchedAt:
                now.toISOString(),

            timezone:
                TIMEZONE,

            rawData:
                data

        };


        /*
           기존 마지막 정상값 저장
        */
        localStorage.setItem(
            "lastKnownGood",
            JSON.stringify(normalRecord)
        );


        /*
           카드 1 화면
        */
        exchangeValue.textContent =
            formattedRate;

        source.textContent =
            normalRecord.source;

        sourceTime.textContent =
            normalRecord.sourceTime;

        fetchedAt.textContent =
            formatKST(normalRecord.fetchedAt);

        rawValue.textContent =
            formattedRate;

        savedValue.textContent =
            formattedRate;

        displayValue.textContent =
            formattedRate;

        rawData.textContent =
            JSON.stringify(data, null, 2);

        liveStatus.textContent =
            "실제 데이터 정상";


        /*
           카드 5
           실제 일별 기록 저장
        */
        saveRealDailyRecord(
            normalRecord
        );


        /*
           카드 5 화면 갱신
        */
        renderRealDailyHistory();

    }

    catch (error) {

        console.error(
            "환율 조회 실패:",
            error
        );


        liveStatus.textContent =
            "실제 데이터 조회 실패";


        /*
           마지막 정상값 사용
        */
        loadLastKnownGood();

    }

}


/* =========================================================
   카드 1
   마지막 정상값
========================================================= */

function loadLastKnownGood() {

    const exchangeValue = $("exchangeValue");
    const source = $("source");
    const sourceTime = $("sourceTime");
    const fetchedAt = $("fetchedAt");
    const savedValue = $("savedValue");
    const displayValue = $("displayValue");
    const rawValue = $("rawValue");
    const rawData = $("rawData");
    const liveStatus = $("liveStatus");


    const saved =
        localStorage.getItem(
            "lastKnownGood"
        );


    if (!saved) {

        exchangeValue.textContent =
            "데이터 없음";

        source.textContent =
            "정상 데이터 없음";

        sourceTime.textContent =
            "-";

        fetchedAt.textContent =
            "-";

        rawValue.textContent =
            "-";

        savedValue.textContent =
            "-";

        displayValue.textContent =
            "-";

        rawData.textContent =
            "마지막 정상값이 없습니다.";

        return;
    }


    try {

        const record =
            JSON.parse(saved);


        const formatted =
            formatNumber(record.value);


        exchangeValue.textContent =
            formatted;

        source.textContent =
            record.source || "-";

        sourceTime.textContent =
            record.sourceTime || "-";

        fetchedAt.textContent =
            record.fetchedAt
                ? formatKST(record.fetchedAt)
                : "-";

        rawValue.textContent =
            formatted;

        savedValue.textContent =
            formatted;

        displayValue.textContent =
            formatted;

        rawData.textContent =
            JSON.stringify(
                record.rawData || record,
                null,
                2
            );

        liveStatus.textContent =
            "마지막 정상값 표시";

    }

    catch (error) {

        console.error(
            "마지막 정상값 처리 실패:",
            error
        );

    }

}


/* =========================================================
   카드 4
   합성 테스트 fixture
========================================================= */

const fixtures = {

    "T04-NORMAL-D1-A": {

        type: "success",

        recordDate:
            "2026-08-24",

        value:
            100,

        unit:
            "synthetic-unit"

    },


    "T04-NORMAL-D1-B": {

        type: "success",

        recordDate:
            "2026-08-24",

        value:
            105,

        unit:
            "synthetic-unit"

    },


    "T04-NORMAL-D2": {

        type: "success",

        recordDate:
            "2026-08-25",

        value:
            120,

        unit:
            "synthetic-unit"

    },


    "T04-TIMEOUT": {

        type: "error",

        errorCode:
            "TIMEOUT",

        message:
            "외부 데이터 응답이 제한 시간 안에 도착하지 않았습니다."

    },


    "T04-AUTH-401": {

        type: "error",

        errorCode:
            "AUTH_401",

        message:
            "외부 데이터 인증에 실패했습니다."

    },


    "T04-RATE-429": {

        type: "error",

        errorCode:
            "RATE_429",

        message:
            "외부 데이터 호출 제한에 도달했습니다."

    },


    "T04-OFFLINE": {

        type: "error",

        errorCode:
            "OFFLINE",

        message:
            "네트워크 연결이 없어 외부 데이터를 가져오지 못했습니다."

    },


    "T04-SCHEMA-BREAK": {

        type: "error",

        errorCode:
            "SCHEMA_BREAK",

        message:
            "외부 데이터 형식이 예상과 다릅니다."

    },


    "T04-RECOVER-D2": {

        type: "success",

        recordDate:
            "2026-08-25",

        value:
            120,

        unit:
            "synthetic-unit"

    }

};


/* =========================================================
   카드 4
   상태 불러오기
========================================================= */

function getReplayState() {

    const saved =
        localStorage.getItem(
            SYNTHETIC_STORAGE_KEY
        );


    if (!saved) {

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


    try {

        return JSON.parse(saved);

    }

    catch {

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

}


/* =========================================================
   카드 4
   상태 저장
========================================================= */

function saveReplayState(state) {

    localStorage.setItem(
        SYNTHETIC_STORAGE_KEY,
        JSON.stringify(state)
    );

}


/* =========================================================
   카드 4
   일별 기록 저장
========================================================= */

function saveDailyRecord(
    state,
    fixture
) {

    const record = {

        recordDate:
            fixture.recordDate,

        value:
            fixture.value,

        unit:
            fixture.unit

    };


    const existingIndex =
        state.records.findIndex(
            item =>
                item.recordDate ===
                fixture.recordDate
        );


    if (existingIndex >= 0) {

        state.records[existingIndex] =
            record;

    }

    else {

        state.records.push(
            record
        );

    }


    state.records.sort(
        (a, b) =>
            a.recordDate.localeCompare(
                b.recordDate
            )
    );


    state.lastKnownGood =
        record;

}


/* =========================================================
   카드 4
   fixture 재생
========================================================= */

function replayFixture(
    fixtureId
) {

    const fixture =
        fixtures[fixtureId];


    if (!fixture) {
        return;
    }


    const state =
        getReplayState();


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

    }

    else {

        state.status =
            "stale";

        state.errorCode =
            fixture.errorCode;

        state.pendingRecovery =
            true;

    }


    saveReplayState(
        state
    );


    renderReplayState(
        state
    );

}


/* =========================================================
   카드 4
   화면 표시
========================================================= */

function renderReplayState(
    state
) {

    if ($("readingStatus")) {

        $("readingStatus").textContent =
            state.status;

    }


    if ($("errorCode")) {

        $("errorCode").textContent =
            state.errorCode;

    }


    if ($("recordCount")) {

        $("recordCount").textContent =
            `${state.records.length}건`;

    }


    const failureMessage =
        $("failureMessage");


    if (failureMessage) {

        if (
            state.status ===
            "stale"
        ) {

            failureMessage.innerHTML = `

                <strong>
                    외부 데이터 조회에 실패했습니다.
                </strong>

                <p>
                    오류 코드:
                    ${escapeHtml(state.errorCode)}
                    <br>
                    마지막 정상값을 유지합니다.
                </p>

            `;

        }

        else {

            failureMessage.innerHTML = `

                <strong>
                    정상 상태입니다.
                </strong>

                <p>
                    현재 데이터가 정상적으로 처리되었습니다.
                </p>

            `;

        }

    }


    const staleBadge =
        $("staleBadge");


    if (staleBadge) {

        staleBadge.textContent =
            state.status === "stale"
                ? "STALE"
                : "FRESH";

    }


    const lastGoodValue =
        $("lastKnownGoodValue");

    const lastGoodDate =
        $("lastKnownGoodDate");


    if (
        state.lastKnownGood &&
        lastGoodValue &&
        lastGoodDate
    ) {

        lastGoodValue.textContent =
            `${formatNumber(state.lastKnownGood.value)}
             ${state.lastKnownGood.unit}`;

        lastGoodDate.textContent =
            state.lastKnownGood.recordDate;

    }


    const nextAction =
        $("nextAction");


    const retryButton =
        $("retryButton");


    if (state.pendingRecovery) {

        if (nextAction) {

            nextAction.textContent =
                "외부 데이터가 다시 정상인지 확인한 후 재시도하세요.";

        }


        if (retryButton) {

            retryButton.disabled =
                false;

        }

    }

    else {

        if (nextAction) {

            nextAction.textContent =
                "정상 데이터를 조회할 수 있습니다.";

        }


        if (retryButton) {

            retryButton.disabled =
                true;

        }

    }


    renderSyntheticHistory(
        state.records
    );

}


/* =========================================================
   카드 4
   합성 기록 화면
========================================================= */

function renderSyntheticHistory(
    records
) {

    const container =
        $("dailyHistory");


    if (!container) {
        return;
    }


    if (!records.length) {

        container.innerHTML = `

            <p class="empty-history">
                아직 합성 기록이 없습니다.
            </p>

        `;

        return;
    }


    container.innerHTML =
        records
            .slice()
            .sort(
                (a, b) =>
                    a.recordDate.localeCompare(
                        b.recordDate
                    )
            )
            .map(
                record => `

                    <div class="history-row">

                        <div class="history-date">
                            ${escapeHtml(record.recordDate)}
                        </div>

                        <div class="history-value">
                            ${formatNumber(record.value)}
                        </div>

                        <div class="history-meta">
                            <strong>단위</strong><br>
                            ${escapeHtml(record.unit)}
                        </div>

                        <div class="history-meta">
                            <strong>종류</strong><br>
                            합성 시험값
                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   카드 5
   실제 일별 기록 가져오기
========================================================= */

function getRealDailyRecords() {

    const saved =
        localStorage.getItem(
            REAL_DAILY_STORAGE_KEY
        );


    if (!saved) {
        return [];
    }


    try {

        const records =
            JSON.parse(saved);


        if (!Array.isArray(records)) {
            return [];
        }


        return records;

    }

    catch {

        return [];

    }

}


/* =========================================================
   카드 5
   실제 일별 기록 저장
========================================================= */

function saveRealDailyRecord(
    record
) {

    const records =
        getRealDailyRecords();


    const existingIndex =
        records.findIndex(
            item =>
                item.recordDate ===
                record.recordDate
        );


    /*
       같은 KST 날짜:
       기존 기록 갱신
    */
    if (existingIndex >= 0) {

        records[existingIndex] =
            record;

    }

    /*
       다른 KST 날짜:
       새 기록 추가
    */
    else {

        records.push(
            record
        );

    }


    /*
       날짜순 정렬
    */
    records.sort(
        (a, b) =>
            a.recordDate.localeCompare(
                b.recordDate
            )
    );


    localStorage.setItem(
        REAL_DAILY_STORAGE_KEY,
        JSON.stringify(records)
    );

}


/* =========================================================
   카드 5
   실제 기록 화면
========================================================= */

function renderRealDailyHistory() {

    const records =
        getRealDailyRecords();


    const count =
        $("realRecordCount");


    if (count) {

        count.textContent =
            `${records.length}건`;

    }


    renderRealLatestSource(
        records
    );


    renderDayOverDay(
        records
    );


    renderRealHistory(
        records
    );

}


/* =========================================================
   카드 5
   최신 실제 원천 표시
========================================================= */

function renderRealLatestSource(
    records
) {

    const url =
        $("realSourceUrl");

    const observationTime =
        $("realObservationTime");

    const normalizedValue =
        $("realNormalizedValue");

    const unit =
        $("realUnit");

    const savedValue =
        $("realSavedValue");

    const displayValue =
        $("realDisplayValue");


    if (!records.length) {

        if (url) {
            url.textContent = "-";
        }

        if (observationTime) {
            observationTime.textContent = "-";
        }

        if (normalizedValue) {
            normalizedValue.textContent = "-";
        }

        if (unit) {
            unit.textContent = "-";
        }

        if (savedValue) {
            savedValue.textContent = "-";
        }

        if (displayValue) {
            displayValue.textContent = "-";
        }

        return;

    }


    const latest =
        records[records.length - 1];


    if (url) {

        url.textContent =
            latest.sourceUrl || "-";

    }


    if (observationTime) {

        observationTime.textContent =
            latest.sourceTime || "-";

    }


    if (normalizedValue) {

        normalizedValue.textContent =
            formatNumber(latest.value);

    }


    if (unit) {

        unit.textContent =
            latest.unit || "-";

    }


    if (savedValue) {

        savedValue.textContent =
            formatNumber(latest.value);

    }


    if (displayValue) {

        displayValue.textContent =
            formatNumber(latest.value);

    }

}


/* =========================================================
   카드 5
   어제 대비 계산
========================================================= */

function renderDayOverDay(
    records
) {

    const previousDayValue =
        $("previousDayValue");

    const currentDayValue =
        $("currentDayValue");

    const dayOverDayValue =
        $("dayOverDayValue");

    const explanation =
        $("dayOverDayExplanation");


    /*
       두 날짜가 아직 없을 때
    */
    if (records.length < 2) {

        if (previousDayValue) {
            previousDayValue.textContent =
                "-";
        }

        if (currentDayValue) {
            currentDayValue.textContent =
                "-";
        }

        if (dayOverDayValue) {
            dayOverDayValue.textContent =
                "-";
        }

        if (explanation) {

            explanation.textContent =
                "서로 다른 두 날짜의 실제 기록이 쌓이면 어제 대비 변화가 계산됩니다.";

        }

        return;

    }


    const sorted =
        records
            .slice()
            .sort(
                (a, b) =>
                    a.recordDate.localeCompare(
                        b.recordDate
                    )
            );


    const previous =
        sorted[sorted.length - 2];

    const current =
        sorted[sorted.length - 1];


    /*
       같은 계산 규칙:
       현재 값 - 이전 값
    */
    const change =
        Number(current.value) -
        Number(previous.value);


    if (previousDayValue) {

        previousDayValue.textContent =
            `${formatNumber(previous.value)} KRW`;

    }


    if (currentDayValue) {

        currentDayValue.textContent =
            `${formatNumber(current.value)} KRW`;

    }


    if (dayOverDayValue) {

        const sign =
            change > 0
                ? "+"
                : "";

        dayOverDayValue.textContent =
            `${sign}${formatNumber(change)} KRW`;

    }


    if (explanation) {

        const sign =
            change > 0
                ? "+"
                : "";

        explanation.textContent =
            `${previous.recordDate} 값 ${formatNumber(previous.value)} → ` +
            `${current.recordDate} 값 ${formatNumber(current.value)} · ` +
            `계산: ${formatNumber(current.value)} - ` +
            `${formatNumber(previous.value)} = ` +
            `${sign}${formatNumber(change)} KRW`;

    }

}


/* =========================================================
   카드 5
   실제 기록 목록
========================================================= */

function renderRealHistory(
    records
) {

    const container =
        $("realDailyHistory");


    if (!container) {
        return;
    }


    if (!records.length) {

        container.innerHTML = `

            <p class="empty-history">
                아직 실제 일별 기록이 없습니다.
            </p>

        `;

        return;

    }


    const sorted =
        records
            .slice()
            .sort(
                (a, b) =>
                    a.recordDate.localeCompare(
                        b.recordDate
                    )
            );


    container.innerHTML =
        sorted
            .map(
                record => `

                    <div class="real-history-row">

                        <div class="real-history-date">
                            ${escapeHtml(record.recordDate)}
                        </div>


                        <div class="real-history-value">
                            ${formatNumber(record.value)}
                            KRW
                        </div>


                        <div class="real-history-details">

                            <div>
                                <strong>원천:</strong>
                                ${escapeHtml(record.source || "-")}
                            </div>

                            <div>
                                <strong>URL:</strong>
                                ${escapeHtml(record.sourceUrl || "-")}
                            </div>

                            <div>
                                <strong>원천 기준 날짜:</strong>
                                ${escapeHtml(record.sourceTime || "-")}
                            </div>

                            <div>
                                <strong>단위:</strong>
                                ${escapeHtml(record.unit || "-")}
                            </div>

                            <div>
                                <strong>저장값:</strong>
                                ${formatNumber(record.value)}
                                KRW
                            </div>

                            <div>
                                <strong>조회 시각:</strong>
                                ${record.fetchedAt
                                    ? escapeHtml(
                                        formatKST(
                                            record.fetchedAt
                                        )
                                    )
                                    : "-"}

                            </div>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   HTML 안전 처리
========================================================= */

function escapeHtml(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   이벤트
========================================================= */


/*
   합성 fixture 버튼
*/
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


/*
   합성 테스트 다시 시도
*/
const retryButton =
    $("retryButton");


if (retryButton) {

    retryButton.addEventListener(
        "click",
        () => {

            const state =
                getReplayState();


            if (
                state.pendingRecovery
            ) {

                replayFixture(
                    "T04-RECOVER-D2"
                );

            }

        }
    );

}


/*
   합성 테스트 초기화
*/
const resetReplay =
    $("resetReplay");


if (resetReplay) {

    resetReplay.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                SYNTHETIC_STORAGE_KEY
            );


            renderReplayState(
                getReplayState()
            );

        }
    );

}


/* =========================================================
   초기 실행
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
           카드 4
        */
        renderReplayState(
            getReplayState()
        );


        /*
           카드 5
           기존 실제 기록 표시
        */
        renderRealDailyHistory();


        /*
           카드 1
           실제 공개 API 조회
        */
        loadExchangeRate();

 const copyExchangeRateButton =
            $("copyExchangeRate");

        if (copyExchangeRateButton) {

            copyExchangeRateButton.addEventListener(
                "click",
                copyExchangeRate
            );

        }

    }
);
