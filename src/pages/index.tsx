import styles from "../styles/Home.module.css";

import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAuth } from "../context/authProvider";
import Header from "../components/Header/Header";
import FeaturedMovie from "../components/FeaturedMovie/FeaturedMovie";
import axios from "../config/axios";
import requests, {
  fetchMovieForFeatured,
  filterList,
  filterMovieForFeatured,
} from "../config/requests";
import { MovieFromFeatured, MovieFromListItem } from "../../typings";
import { useState } from "react";
import Footer from "../components/Footer/Footer";
import Loader from "../components/Loader/Loader";
import List from "../components/List/List";

interface Props {
  featuredMovie: MovieFromFeatured;
  trendingMovies: MovieFromListItem[];
  topRatedMovies: MovieFromListItem[];
}

const FEATURED_MOVIE_INTRO = "One of this Week's Trending Films";

const IndexPage: NextPage<Props> = ({
  featuredMovie,
  trendingMovies,
  topRatedMovies,
}) => {
  const { user, userIsLoading } = useAuth();
  const router = useRouter();
  const [nextPageIsLoading, setNextPageIsLoading] = useState<boolean>(false);
  const [genresAreOpen, setGenresAreOpen] = useState<boolean>(false);

  if (userIsLoading) return null;
  if (!user) router.push("/auth");

  /**
   * When the back or forward button is pressed, set page to loading
   */
  window.onpopstate = () => {
    setNextPageIsLoading(true);
  };

  /**
   * When the refresh button is pressed, set page to loading
   */
  window.onbeforeunload = () => {
    setNextPageIsLoading(true);
  };

  return (
    <div className={styles.homePage}>
      {user && (
        <>
          <Head>
            <title>My Movies</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          {nextPageIsLoading && <Loader />}
          <Header
            setNextPageIsLoading={setNextPageIsLoading}
            homeIsCurrentPage={true}
            collectionIsCurrentPage={false}
            genresAreOpen={genresAreOpen}
            setGenresAreOpen={setGenresAreOpen}
          />
          <FeaturedMovie
            selectedMovie={featuredMovie}
            selectedMovieIntro={FEATURED_MOVIE_INTRO}
          />
          <List
            isGradientBackground={true}
            isLast={false}
            title="Trending Now"
            movieList={trendingMovies}
            setNextPageIsLoading={setNextPageIsLoading}
          />
          <List
            isGradientBackground={false}
            isLast={true}
            title="Top Rated"
            movieList={topRatedMovies}
            setNextPageIsLoading={setNextPageIsLoading}
          />
          <Footer />
        </>
      )}
    </div>
  );
};

export default IndexPage;

export const getServerSideProps: GetServerSideProps = async () => {
  const trendingMoviesResponse = await axios.get(requests.fetchTrendingMovies);
  const featuredMovieId =
    trendingMoviesResponse.data.results[
      Math.floor(Math.random() * trendingMoviesResponse.data.results.length)
    ]?.id;
  var trendingMovies = filterList(
    trendingMoviesResponse.data.results,
    featuredMovieId
  );

  const featuredMovieResponse = await axios.get(
    fetchMovieForFeatured(featuredMovieId)
  );
  const featuredMovie = filterMovieForFeatured(featuredMovieResponse.data);

  const topRatedMoviesResponse = await axios.get(requests.fetchTopRatedMovies);
  const topRatedMovies = filterList(
    topRatedMoviesResponse.data.results,
    featuredMovieId
  );

  return {
    props: {
      featuredMovie,
      trendingMovies,
      topRatedMovies,
    },
  };
};
