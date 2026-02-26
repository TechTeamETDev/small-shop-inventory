<!DOCTYPE html>
<html>
<head>
    <title>Employee Dashboard</title>
</head>
<body>
    <h1>Welcome, {{ auth()->user()->name }} (Employee)</h1>

    <form method="POST" action="{{ route('logout') }}">
        @csrf
        <button type="submit">Logout</button>
    </form>

    <p>Employee dashboard content goes here (view stock, log sales, etc.)</p>
</body>
</html>