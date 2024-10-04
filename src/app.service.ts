// src/redis.service.ts
import { Injectable, Logger } from '@nestjs/common';

import axios from 'axios';
import * as dotenv from 'dotenv';
import { BoxOfficeResult } from './boxOffice.interface';

dotenv.config();

@Injectable()
export class AppService {
  async fetchPopularMoviesAndPoster() {
    const { weeklyBoxOfficeList } = await this.fetchPopularMovies();

    const movieDetails = await Promise.all(
      weeklyBoxOfficeList.slice(0, 10).map(async (movie) => {
        const formattedTitle = await this.formatTitleWithSpaces(movie.movieNm);
        const posterPath = await this.fetchPosterPath(formattedTitle);
        return { ...movie, poster_path: posterPath };
      }),
    );
    return movieDetails;
  }

  private async fetchPosterPath(title: string): Promise<string> {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?query=${title}&api_key=ece2d05e890957c089467037825151a2`,
    );
    return response.data.results[0]?.poster_path || ''; // 첫 번째 결과의 poster_path 반환
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
