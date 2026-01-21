from flask import Flask, render_template, redirect, url_for, request

app = Flask(__name__)

# 1. 로그인 페이지
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # 나중에 여기서 localStorage + 로그인 검증 예정
        print(request.form)
        
        if(request.form.get("txtUserID") == "12341234" and request.form.get("txtPwd") == "12341234"):
            return redirect(url_for("basic"))
        else:
            return render_template(
                "login.html",
                error=True,
                # student_id=student_id
            )
    return render_template("login.html")

# 2. 기본 페이지
@app.route("/basic")
def basic():
    return render_template("basic.html")

# 3. 수강신청 페이지
@app.route("/sinchung")
def sinchung():
    return render_template("sinchung.html")


if __name__ == "__main__":
    app.run(debug=True)
