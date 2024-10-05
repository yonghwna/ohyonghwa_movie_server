// src/redis.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';

import axios from 'axios';
import * as dotenv from 'dotenv';
import { BoxOfficeResult } from './boxOffice.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';
dotenv.config();

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  // 서버가 시작될 때 이 메서드가 호출됨
  async onModuleInit() {
    Logger.log('AppService initialized, prefetching popular movies...');
    await this.fetchPopularMoviesAndPoster(); // 미리 캐시 채우기
  }

  // 캐시를 주기적으로 갱신하는 작업 (예: 6시간마다 실행)
  @Cron('0 */6 * * *')
  async handleCron() {
    await this.fetchPopularMoviesAndPoster();
  }

  async fetchPopularMoviesAndPoster() {
    const { weeklyBoxOfficeList } = await this.fetchPopularMovies();

    const movieDetails = await Promise.all(
      weeklyBoxOfficeList.slice(0, 10).map(async (movie) => {
        const formattedTitle = await this.formatTitleWithSpaces(movie.movieNm);
        const movieData = await this.fetchPosterPath(formattedTitle);
        return { ...movie, movieData };
      }),
    );
    await this.cacheManager.set('popular_movie', movieDetails);
    Logger.log('Popular movies fetched and cached.');
    return movieDetails; // 캐싱한 데이터를 반환
  }
  async getPopularMoviesAndPoster() {
    const cachedData = await this.cacheManager.get('popular_movie');
    if (cachedData) {
      return cachedData;
    } else {
      const movieDetails = await this.fetchPopularMoviesAndPoster(); // 캐시 설정과 동시에 데이터 반환
      return movieDetails; // 캐시 설정 후 다시 캐시를 조회하지 않음
    }
  }

  async deleteCache() {
    await this.cacheManager.del('popular_movie');
  }
  private async fetchPosterPath(title: string): Promise<string> {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?query=${title}&api_key=ece2d05e890957c089467037825151a2&language=ko-KR`,
    );
    return response.data.results[0] || ''; // 첫 번째 결과의 poster_path 반환
  }

  private async fetchPopularMovies(): Promise<BoxOfficeResult> {
    const popularMoviesResponse = await axios.get(
      process.env.KOFIC_POPULAR_MOVIE_API,
    );

    return popularMoviesResponse.data.boxOfficeResult; // 직접적으로 boxOfficeResult 반환
  }

  private async formatTitleWithSpaces(title) {
    let formattedTitle = '';

    for (let i = 0; i < title.length; i++) {
      // 현재 문자가 숫자인지 확인
      const isCurrentCharDigit = /\d/.test(title[i]);

      // 이전 문자가 숫자가 아니고 현재 문자가 숫자일 경우
      if (i > 0 && !/\d/.test(title[i - 1]) && isCurrentCharDigit) {
        formattedTitle += ' '; // 공백 추가
      }

      // 이전 문자가 숫자이고 현재 문자가 숫자가 아닐 경우
      if (i > 0 && /\d/.test(title[i - 1]) && !isCurrentCharDigit) {
        formattedTitle += ' '; // 공백 추가
      }

      formattedTitle += title[i]; // 현재 문자 추가
    }

    return formattedTitle;
  }
}
