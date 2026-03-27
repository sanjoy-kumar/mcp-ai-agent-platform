from flask import Blueprint, request, jsonify
from models import User
from database import db
from flask_jwt_extended import create_access_token
import bcrypt

user_bp = Blueprint("user", __name__)


@user_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    hashed_pw = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt()
    )

    user = User(
        email=data["email"],
        password=hashed_pw.decode("utf-8")
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered"})


@user_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.checkpw(
        data["password"].encode("utf-8"),
        user.password.encode("utf-8")
    ):
        return jsonify({"error": "Invalid password"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "access_token": token
    })
