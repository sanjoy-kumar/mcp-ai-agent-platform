from flask import Blueprint, request, jsonify
from services.mcp_service import call_mcp_agent
from models import ChatSession, ChatMessage
from database import db
from flask_jwt_extended import jwt_required, get_jwt_identity

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/send", methods=["POST"])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    query = data.get("query")
    session_id = data.get("session_id")

    if not query:
        return {"msg": "Query required"}, 400

    # Save user message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        text=query
    )
    db.session.add(user_msg)

    # Call MCP
    result = call_mcp_agent(query)

    # Save AI response
    bot_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        text=result.get("result")
    )
    db.session.add(bot_msg)

    db.session.commit()

    return jsonify(result)


@chat_bp.route("/session", methods=["POST"])
@jwt_required()
def create_session():
    user_id = int(get_jwt_identity())

    session = ChatSession(
        title="New Chat",
        user_id=user_id
    )

    db.session.add(session)
    db.session.commit()

    return {"session_id": session.id}


@chat_bp.route("/sessions", methods=["GET"])
@jwt_required()
def get_sessions():
    user_id = int(get_jwt_identity())

    sessions = ChatSession.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": s.id,
            "title": s.title
        } for s in sessions
    ])


@chat_bp.route("/messages/<int:session_id>", methods=["GET", "OPTIONS"])
@jwt_required()
def get_messages(session_id):
    messages = ChatMessage.query.filter_by(session_id=session_id).all()

    return jsonify([
        {
            "role": m.role,
            "text": m.text
        } for m in messages
    ])


@chat_bp.route("/session/<int:session_id>", methods=["PUT"])
@jwt_required()
def update_session(session_id):
    data = request.get_json()
    title = data.get("title")

    session = ChatSession.query.get(session_id)

    if not session:
        return {"msg": "Session not found"}, 404

    session.title = title
    db.session.commit()

    return {"msg": "Updated"}


@chat_bp.route("/session/<int:session_id>", methods=["DELETE"])
@jwt_required()
def delete_session(session_id):
    session = ChatSession.query.get(session_id)

    if not session:
        return {"msg": "Session not found"}, 404

    # delete messages first
    ChatMessage.query.filter_by(session_id=session_id).delete()

    db.session.delete(session)
    db.session.commit()

    return {"msg": "Deleted"}
