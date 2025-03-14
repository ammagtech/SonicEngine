import React from "react";
import "./styles.css";
import Text from "../../../../UI/Text";
import PlaceholderLoader from "../../../../UI/PlaceholderLoader";

const PlayItem = ({ game }) => {
  const [loading, setLoading] = React.useState(true);

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <a
      href={game.GameURL}
      target="_blank"
      rel="noreferrer noopener"
      className="play-item"
    >
      <div className="thumbnail-container">
        {loading && <div className="thumbnail-loading"><PlaceholderLoader /></div>}
        <img
          className={`game-thumbnail ${!loading ? 'loaded' : ''}`}
          src={game.GameThumbnail}
          alt={game.GameName}
          onLoad={handleImageLoad}
        />
        <div className="game-info">
          <Text>
            <p className="game-title">{game.GameName}</p>
          </Text>
        </div>
      </div>
    </a>
  );
};

export default PlayItem;