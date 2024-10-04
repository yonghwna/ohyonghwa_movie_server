// src/interfaces/boxOffice.interface.ts

export interface WeeklyBoxOffice {
  rnum: string; // 순번
  rank: string; // 순위
  rankInten: string; // 순위 변동
  rankOldAndNew: string; // 신규/구분
  movieCd: string; // 영화 코드
  movieNm: string; // 영화 제목
  openDt: string; // 개봉일
  salesAmt: string; // 매출액
  salesShare: string; // 매출 비율
  salesInten: string; // 매출 변동
  salesChange: string; // 매출 증감률
  salesAcc: string; // 누적 매출액
  audiCnt: string; // 관객 수
  audiInten: string; // 관객 변동
  audiChange: string; // 관객 증감률
  audiAcc: string; // 누적 관객 수
  scrnCnt: string; // 상영관 수
  showCnt: string; // 상영 횟수
}

export interface BoxOfficeResult {
  boxOfficeType: string; // 박스오피스 유형
  showRange: string; // 상영 기간
  yearWeekTime: string; // 연도 주
  weeklyBoxOfficeList: WeeklyBoxOffice[]; // 주간 박스오피스 리스트
}
