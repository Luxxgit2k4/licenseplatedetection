1. Removed the .post method thing from main.py as it's not required.
2. Then updated the code to run the server with python main.py.
3. It seems uvicorn has a default log config named uvicorn.config.LOGGING_CONFIG which stores access logs and error logs as a dictionary. So trying to import the default config and check the logging in terminal itself.  
```python
log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
if __name__ == "__main__":
    uvicorn.run(luffy, host="127.0.0.1", port=8000)

```

Tried logging with the above code which perfectly logged in the terminal along with timestamps.
And this was the output: 
```
python main.py
INFO:     Started server process [47267]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
2025-01-31 20:00:05,446 - INFO - 127.0.0.1:60468 - "GET /licenseplate HTTP/1.1" 200
2025-01-31 20:00:22,097 - INFO - 127.0.0.1:60884 - "GET /database HTTP/1.1" 200

```

And for custom logging we can add handlers to have some logs alone. These are the following logs we have in default:

uvicorn.access - It gives the method, path and status code. 
uvicorn.error - It states the errors.
uvicorn.lifespan - It gives the startup and shutdown of the server.
uvicorn.workers - It gives the workers process.
uvicorn.debug - It gives the 
