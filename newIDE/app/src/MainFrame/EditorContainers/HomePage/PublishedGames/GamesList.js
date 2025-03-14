import React, { useEffect, useState } from "react";
import axios from "axios";
import PlayItem from "./PlayItem";
import "./styles.css";
import { ProjectApi } from "../../../../Utils/GDevelopServices/ApiConfigs";

const GamesList = ({setloading}) => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    axios.get(`${ProjectApi.baseUrl}/getPublishedGames`) 
      .then((res) => {
        setGames(res.data);
        setloading(false);
      })
      .catch((error) => {
        console.error("Error fetching games:", error);
        setloading(false);
      });
  }, [setloading]);

  return (
    <div className="games-grid">
      {games.map((game) => (
        <PlayItem key={game._id} game={game} />
      ))}
    </div>
  );
};

export default React.memo(GamesList);
