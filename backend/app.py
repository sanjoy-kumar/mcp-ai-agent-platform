from flask import Flask
from flask_cors import CORS
from config import Config
from database import db
from routes.chat import chat_bp
from flask_jwt_extended import JWTManager
from routes.user import user_bp

jwt = JWTManager()

app = Flask(__name__)
app.config.from_object(Config)

jwt.init_app(app)


CORS(app, supports_credentials=True)
db.init_app(app)

app.register_blueprint(chat_bp, url_prefix="/chat")
app.register_blueprint(user_bp, url_prefix="/user")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(port=5000, debug=True)
