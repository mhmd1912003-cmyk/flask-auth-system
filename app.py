from flask import Flask, redirect, render_template, request, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///mydatabase.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)


# Create DB
with app.app_context():
    db.create_all()


# Routes
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get("name")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm_password = request.form.get("confirmPassword")

        # Validation
        if not name:
            return render_template("register.html", errormsg="الاسم مطلوب")

        if not email or not password:
            return render_template("register.html", errormsg="الإيميل والباسورد مطلوبين")

        if password != confirm_password:
            return render_template("register.html", errormsg="كلمة السر غير متطابقة")

        if User.query.filter_by(email=email).first():
            return render_template("register.html", errormsg="الإيميل موجود بالفعل")

        # Hash password AFTER validation
        hashed_password = generate_password_hash(password)

        user = User(name=name, email=email, password=hashed_password)
        db.session.add(user)
        db.session.commit()

        return redirect(url_for('login'))

    return render_template("register.html")


@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == 'POST':
        email = request.form.get("email")
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            return redirect(url_for('index'))
        else:
            return render_template("login.html", errormsg="البريد أو كلمة السر غلط")

    return render_template("login.html")


if __name__ == "__main__":
    app.run(debug=True)