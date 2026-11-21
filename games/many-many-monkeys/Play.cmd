@echo off
cd /d "%~dp0\..\.."
start "" http://127.0.0.1:5215/
call npm.cmd run dev -w games/many-many-monkeys

