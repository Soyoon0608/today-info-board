// ========================================
// 오늘의 진짜 정보판
// 공개 API만 사용합니다.
// API Key, 비밀번호, 토큰을 저장하지 않습니다.
// ========================================


// 비밀키 없는 공개 데이터 호출 경로
const API_URL =
    "https://api.frankfurter.app/latest?from=USD&to=KRW";


// ========================================
// DOM 요소
// ========================================

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

const rawData =
    document.getElementById("rawData");


// ========================================
// KST 시간 변환
// ========================================

function formatKST(date) {

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            timeZone: "Asia/Seoul",

            year: "numeric",
            month: "2-digit",
            day: "2-digit",

            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",

            hour12: false
        }
    ).format(date);

}


// ========================================
// 환율 조회
// ========================================

async function loadExchangeRate() {

    try {

        // API 호출
        const response =
            await fetch(API_URL);


        // HTTP 오류 확인
        if (!response.ok) {

            throw new Error(
                `HTTP 오류: ${response.status}`
            );

        }


        // JSON 변환
        const data =
            await response.json();


        // 실제 환율 값
        const rate =
            data.rates.KRW;


        // 데이터 검증
        if (
            typeof rate !== "number" ||
            !Number.isFinite(rate)
        ) {

            throw new Error(
                "환율 데이터가 올바르지 않습니다."
            );

        }


        // ========================================
        // 조회 시각
        // ========================================

        const now =
            new Date();


        // ========================================
        // 화면 표시용 값
        // ========================================

        const formattedRate =
            rate.toLocaleString(
                "ko-KR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


        // ========================================
        // 정상 데이터 객체
        // ========================================

        const normalRecord = {

            value: rate,

            formattedValue:
                `${formattedRate} KRW`,

            unit:
                "KRW per 1 USD",

            source:
                "Frankfurter 공개 환율 API",

            // API 기준 날짜
            sourceTime:
                data.date,

            // 실제 조회 시간
            fetchedAt:
                now.toISOString(),

            timezone:
                "Asia/Seoul (KST)",

            rawData:
                data
        };


        // ========================================
        // 마지막 정상값 저장
        // ========================================

        localStorage.setItem(
            "lastKnownGood",
            JSON.stringify(normalRecord)
        );


        // ========================================
        // 원자료 표시
        // ========================================

        rawData.textContent =
            JSON.stringify(
                data,
                null,
                2
            );


        // ========================================
        // 화면 값 표시
        // ========================================

        exchangeValue.textContent =
            formattedRate;


        savedValue.textContent =
            normalRecord.formattedValue;


        displayValue.textContent =
            `${formattedRate} KRW`;


        // ========================================
        // 출처 표시
        // ========================================

        source.textContent =
            normalRecord.source;


        // ========================================
        // 출처 시각
        // ========================================

        sourceTime.textContent =
            `${data.date} (API 기준 날짜)`;


        // ========================================
        // 조회 시각
        // ========================================

        fetchedAt.textContent =
            `${formatKST(now)} KST`;


        console.log(
            "공개 API 정상 조회 성공"
        );


    } catch (error) {

        console.error(
            "데이터 조회 실패:",
            error
        );


        loadLastKnownGood();

    }

}


// ========================================
// 마지막 정상값 불러오기
// ========================================

function loadLastKnownGood() {

    const saved =
        localStorage.getItem(
            "lastKnownGood"
        );


    if (!saved) {

        console.warn(
            "저장된 정상 데이터가 없습니다."
        );

        return;

    }


    const lastKnownGood =
        JSON.parse(saved);


    const value =
        lastKnownGood.value;


    const formattedRate =
        value.toLocaleString(
            "ko-KR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );


    // 마지막 정상값 표시

    exchangeValue.textContent =
        formattedRate;


    savedValue.textContent =
        lastKnownGood.formattedValue;


    displayValue.textContent =
        lastKnownGood.formattedValue;


    source.textContent =
        lastKnownGood.source;


    sourceTime.textContent =
        lastKnownGood.sourceTime;


    fetchedAt.textContent =
        `${formatKST(
            new Date(
                lastKnownGood.fetchedAt
            )
        )} KST`;


    rawData.textContent =
        JSON.stringify(
            lastKnownGood.rawData,
            null,
            2
        );


    console.warn(
        "현재 데이터를 가져오지 못해 마지막 정상값을 표시합니다."
    );

}


// ========================================
// 시작
// ========================================

loadExchangeRate();
