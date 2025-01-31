1. Removed the .post method thing from main.py as it's not required.
2. Then updated the code to run the server with python main.py.
3. It seems uvicorn has a default log config named uvicorn.config.LOGGING_CONFIG which stores access logs and error logs as a dictionary. So trying to import the default config and check the logging in terminal itself.  
```python
log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
if __name__ == "__main__":
    uvicorn.run(luffy, host="127.0.0.1", port=8000, log_config=log_config)

```

Tried logging with the above code which perfectly logged in the terminal along with timestamps. 
And this was the output: 
```
ppython main.py
INFO:     Started server process [49697]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
2025-01-31 20:09:12,604 - INFO - 127.0.0.1:35876 - "GET /licenseplate HTTP/1.1" 200
2025-01-31 20:09:24,052 - INFO - 127.0.0.1:55568 - "GET /database HTTP/1.1" 200

```

And the uvicorn's default config has two parameters like thing "access" which is used for logging http requests made to the server and "default" which is used for logging errors from the server, server startup and completion. By default head names are in colours but when we use the above code it will over-ride the default log font like the coloured font won't be there and it will be just a plain text. This can be ignored by using your own config file with any name you want for example: log_config.yaml 

4. The client side logs can printed using handlers: 
 
 ```python
customlog = logging.getLogger("logs")
customlog.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
customlog.addHandler(handler)

```

and adding error and info messages in the routing:
```python
 customlog.info(f"Inserted license plate {plate} into database with accuracy {accuracy}%.")
    else:
        customlog.error("Failed to insert data into database.")

```

5. Added a new get route to check for internal server error which throws an exception. You can give a get request to the /servererror route which will throw an error in the console.   






