import styles from "../styles/Search.module.css";

import { GetServerSideProps, NextPage } from "next";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../context/authProvider";
import { useRouter } from "next/router";
import axios from "../config/axios";
import {
  fetchMovieForFeatured,
  fetchRecommendedMovies,
  fetchSearchResults,
  fetchSimilarMovies,
  filterList,
  filterMovieForFeatured,
  filterResults,
} from "../config/requests";
import {
  MovieFromFeatured,
  MovieFromListItem,
  MovieFromThumbnail,
} from "../../typings";
import Message from "../components/Message/Message";
import Results from "../components/Results/Results";
import Loader from "../components/Loader/Loader";
import FeaturedMovie from "../components/FeaturedMovie/FeaturedMovie";
import List from "../components/List/List";

interface Props {
  matchingMovies: MovieFromThumbnail[];
  similarMovies: MovieFromListItem[];
  searchedMovie: MovieFromFeatured;
  recommendedMovies: MovieFromListItem[];
}

const SearchPage: NextPage<Props> = ({
  matchingMovies,
  searchedMovie,
  similarMovies,
  recommendedMovies,
}) => {
  const { user, userIsLoading } = useAuth();
  const router = useRouter();
  const [nextPageIsLoading, setNextPageIsLoading] = useState<boolean>(false);

  /**
   * When the new search is loaded, stop the loader display
   */
  useEffect(() => {
    setNextPageIsLoading(false);
  }, [matchingMovies]);

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
    <div className={styles.searchPage}>
      {user && (
        <>
          <Head>
            <title>My Movies - search results</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          {nextPageIsLoading && <Loader />}
          <Header
            setNextPageIsLoading={setNextPageIsLoading}
            homeIsCurrentPage={false}
            collectionIsCurrentPage={false}
          />
          {matchingMovies.length === 0 ? (
            searchedMovie === null ? (
              <Message text="No movies match your query." style={null} />
            ) : (
              <>
                <FeaturedMovie
                  selectedMovie={searchedMovie}
                  selectedMovieIntro={null}
                />
                {similarMovies.length > 0 && (
                  <List
                    isGradientBackground={true}
                    title="Similar Movies"
                    movieList={similarMovies}
                    setNextPageIsLoading={setNextPageIsLoading}
                  />
                )}
                {recommendedMovies.length > 0 && (
                  <List
                    isGradientBackground={false}
                    title="Recommended For You"
                    movieList={recommendedMovies}
                    setNextPageIsLoading={setNextPageIsLoading}
                  />
                )}
              </>
            )
          ) : (
            <Results
              results={matchingMovies}
              setNextPageIsLoading={setNextPageIsLoading}
              title="Search Results"
              isCollection={false}
            />
          )}
          <Footer />
        </>
      )}
    </div>
  );
};

export default SearchPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  var matchingMovies = [];
  var searchedMovie = null;
  var similarMovies = [];
  var recommendedMovies = [];
  const query = context.query.query;
  const id = context.query.id;

  if (query) {
    const matchingMoviesResponse = await axios.get(
      fetchSearchResults(query.toString())
    );
    matchingMovies = await filterResults(matchingMoviesResponse.data.results);
  } else if (id) {
    const searchedMovieResponse = await axios.get(
      fetchMovieForFeatured(parseInt(id as string))
    );
    searchedMovie = filterMovieForFeatured(searchedMovieResponse.data);

    const similarMoviesResponse = await axios.get(
      fetchSimilarMovies(parseInt(id as string))
    );
    similarMovies = await filterList(
      similarMoviesResponse.data.results,
      searchedMovie.id
    );

    const recommendedMoviesResponse = await axios.get(
      fetchRecommendedMovies(parseInt(id as string))
    );
    recommendedMovies = await filterList(
      recommendedMoviesResponse.data.results,
      searchedMovie.id
    );
  }

  return {
    props: {
      matchingMovies,
      searchedMovie,
      similarMovies,
      recommendedMovies,
    },
  };
};
