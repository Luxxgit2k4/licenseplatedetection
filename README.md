# licenseplatedetection
## bupd

# License Plate Detection API

# Commands to RUNN
only one single command need to be run

```sh
❯ docker build -t licenseplate:testing . && dc down && dc up -d && d container logs license-server -f
```

1. docker compose down
2. docker build --secret id=myenv,src=.env -f Dockerfile -t safe .
3. docker compose up -d

This project is a FastAPI-based application for detecting license plates from images and a live webcam feed. It uses OpenCV for image processing, EasyOCR for text recognition, and PostgreSQL for storing detected plates.

## Prerequisites

Ensure you have the following installed before setting up the project:

- PostgreSQL database

- Virtual environment (recommended)


## Installing Pyenv and Managing Python Versions

Pyenv allows you to install and manage multiple versions of Python easily.

1. **Install Pyenv**

    ```
    curl https://pyenv.run | bash
    ```

    Add the following to your zsh or bash shell (`~/.bashrc`, `~/.zshrc`)

    ```
    export PATH="$HOME/.pyenv/bin:$PATH"
    eval "$(pyenv init --path)"
    eval "$(pyenv virtualenv-init -)"
    ```

    Then, restart your terminal or run:

    ```
    source ~/.bashrc  or source ~/.zshrc
    ```

2. **Install an Older Python Version using Pyenv as this version uses an older version**

    ```
    pyenv install 3.10.6
    ```

3. **Set a Python Version for the Project Directory**
    Navigate to your project folder and run:

    ```
    pyenv local 3.10.6
    ```

4. **Set a Python Version for a Virtual Environment**

    ```
    pyenv virtualenv 3.10.6
    pyenv activate myenv     ```


#
## Setting Up the Environment

1. **Clone the repository:**

    ```
    git clone https://github.com/Luxxgit2k4/licenseplatedetection.git
    cd licenseplatedetection
    ```

2. **Create and activate a virtual environment:**

    ```
    python -m myenv environment_name
    source environment_name/bin/activate
    ```

3. **Install the required dependencies:**

    ```
    pip install -r requirements.txt
    ```


## Setting Up PostgreSQL Database

1. **Start PostgreSQL and create the database:**

    ```
    CREATE DATABASE licenseplate;
    ```

2. **Create the table for storing license plates:**

    ```
    CREATE TABLE plates (
        license_plate_number TEXT PRIMARY KEY,
        vehicle_entered BOOLEAN,
        accuracy_percentage INTEGER
    );
    ```

3. **Ensure your PostgreSQL credentials match the ones in** `**main.py**` **(modify if needed):**

    ```
    conn = psycopg2.connect(
        host="localhost",
        dbname="licenseplate",
        user="postgres",
        password="yourpassword"
    )
    ```


## Running the Application

1. **Start the FastAPI server:**

    ```
    uvicorn main:luffy --host 0.0.0.0 --port 8000 --reload
    ```

2. **Access the API documentation at:**

    - http://127.0.0.1:8000/docs

    - http://127.0.0.1:8000/redoc


## Using the Endpoints
### You can use curl or postman to give calls I used curl btw.

1. **Start Webcam License Plate Detection:**

    ```
    curl -X 'GET' 'http://127.0.0.1:8000/licenseplate' -H 'accept: application/json'
    ```

2. **Retrieve All Detected Plates from Database:**

    ```
    curl -X 'GET' 'http://127.0.0.1:8000/database' -H 'accept: application/json'
    ```


## Troubleshooting

- **Error: "Cascade file not loaded correctly"**

    - Ensure the model file `indian_license_plate.xml` is placed correctly in the `model/` directory.

- **Database connection issues**

    - Verify your PostgreSQL service is running.

    - Ensure credentials in `main.py` are correct.

    - Run `psql -U postgres -d licenseplate` to check the database connection.

## License

This project is licensed under the MIT License.
