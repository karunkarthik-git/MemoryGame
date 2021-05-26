import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown'
import "./styles.scss";

import Grid from "./Grid";

const useInterval = (callback, delay, duration) => {
  const durationRef = useRef(duration);
  const durationIntervalRef = useRef();

  const handler = () => {
    callback(durationRef);
  };

  useEffect(
    () => {
      const durationInterval = setInterval(handler, delay);
      durationIntervalRef.current = durationInterval;
      return () => {
        clearInterval(durationInterval);
      };
    },
    [delay]
  );

  return durationIntervalRef;
};

function App() {
  const [newGame, setNewGame] = useState(false);
  const [list, setList] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const [duration, setDuration] = useState(0);
  const [finishedItems, setFinishedItems] = useState([]);
  const [winner, setWinner] = useState(false);
  const [tileNumber, setTileNumber] = useState(0);

  const handleSelect = (e) => {
    setTileNumber(e);
  }

  const checkItems = (firstIndex, secondIndex) => {
    if (
      firstIndex !== secondIndex &&
      list[firstIndex].url === list[secondIndex].url
    ) {
      setFinishedItems([...finishedItems, firstIndex, secondIndex]);
    } else {
      setTimeout(() => {
        setVisibleItems([]);
      }, 600);
    }
  };

  useEffect(
    () => {
      axios
        .get(
          `https://api.unsplash.com/search/photos/?client_id=c0c103ae0af5122685dec516d4275b6471e81c388d2ce0791c61bb8f47285d5d&query=flower&per_page=${tileNumber}`
        )
        .then(res => {
          const newList = res.data.results.map(item => {
            return {
              id: item.id,
              url: item.urls.thumb,
              description: item.alt_description
            };
          });
          setList(
            newList
              .concat(
                newList.map(item => {
                  return {
                    ...item,
                    id: item.id + "1"
                  };
                })
              )
              .sort(() => {
                return 0.5 - Math.random();
              })
          );
        });
    },
    [tileNumber,newGame]
  );

  const durationIntervalRef = useInterval(
    durationRef => {
      durationRef.current++;
      setDuration(durationRef.current);
    },
    1000,
    duration
  );

  useEffect(
    () => {
      if (finishedItems.length > 0 && finishedItems.length === list.length) {
        setWinner(true);
        clearInterval(durationIntervalRef.current);
      }
    },
    [finishedItems,newGame]
  );

  return (
    <div className="text-center p-4 d-flex flex-column">
      <div className="dark">
        <button
        onClick={() => {
          setNewGame(!newGame);
          setTileNumber(0);
          setDuration(0);
          setVisibleItems([]);
          setFinishedItems([]);
          setWinner(false);
        }}
        className="btn btn-dark mb-4"
        >Newgame
        </button>
        <h4 className="d-flex float-left"><u>Memory Game</u></h4>
        <div className="float-right d-flex">
          <h6 className="pr-5">{tileNumber?`Total Duration : ${duration} seconds`:""}</h6>
          {!tileNumber?<DropdownButton
          alignRight
          title="Difficulty Level"
          id="dropdown-menu-align-right"
          onSelect={handleSelect}
        >
          <Dropdown.Item eventKey="5">5</Dropdown.Item>
          <Dropdown.Item eventKey="10">10</Dropdown.Item>
          <Dropdown.Item eventKey="25">25</Dropdown.Item>
        </DropdownButton>:""}
        </div>
      </div>
      
      {tileNumber? list.length === 0 ? (
        <div>...Loading</div>
      ) : (
        <div>
          <Grid
            list={list}
            visibleItems={visibleItems}
            setVisibleItems={setVisibleItems}
            finishedItems={finishedItems}
            checkItems={checkItems}
          />
          {winner && (
            <div>
              You Win !
              <br />
              Finished in {duration} seconds
            </div>
          )}
        </div>
      ):""}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
