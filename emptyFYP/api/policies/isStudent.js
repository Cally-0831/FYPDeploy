module.exports = async function (req, res, proceed) {
    const user = req.session;
    if (user.role == "stu") {
        return proceed();
    }
    console.log("you badbad")
    return res.redirect("home");
}