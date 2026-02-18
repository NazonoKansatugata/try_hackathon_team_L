import { Link } from "react-router-dom";
import NotFoundImg from "../../assets/404page.jpg"
import "./NotFoundPage.css";

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="image-wrapper">
            <img src={NotFoundImg} alt="404page" className="not-found-image" />
        </div>
        <Link to="/">
          <button className="back-home-btn">
            ホームに戻る
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;