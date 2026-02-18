<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
</head>
<body>
    <h2>Login</h2>

    <form method="POST" action="/login">
        @csrf
        <input type="email" name="email" placeholder="Email" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>

    <form method="POST" action="/logout">
        @csrf
        <button type="submit">Logout</button>
    </form>

    <a href="/register">Register</a>
</body>
</html>
