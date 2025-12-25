import { Link, useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = ({
  title = "404",
  text = "Lost your way?",
  subtext = "Sorry, we can't find that page. You'll find lots to explore on the home page.",
  linkText = "Return Home",
}) => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <h1 className="not-found-title">{title}</h1>
      <p className="not-found-text">{text}</p>
      <p className="not-found-subtext">{subtext}</p>
      <div className="not-found-actions">
        <button onClick={() => navigate(-1)} className="back-btn-secondary">
          Go Back
        </button>
        <Link to="/" className="home-btn">
          {linkText}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
