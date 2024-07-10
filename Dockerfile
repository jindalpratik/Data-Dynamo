ARG PYTHON_BASE=3.12-slim
# build stage
FROM python:$PYTHON_BASE AS builder

# install PDM
RUN pip install -U pdm
# disable update check
ENV PDM_CHECK_UPDATE=false
# copy files
COPY backend/pyproject.toml backend/pdm.lock /project/

# install dependencies and project into the local packages directory
WORKDIR /project
RUN pdm install --check --prod --no-editable
ADD https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx /root/.u2net/

# run stage
FROM python:$PYTHON_BASE

# retrieve packages from build stage
COPY --from=builder /project/.venv/ /project/.venv
COPY --from=builder /root/.u2net/ /root/.u2net
ENV PATH="/project/.venv/bin:$PATH"
# set command/entrypoint, adapt to fit your needs
COPY backend/src /project/src
COPY .env /project/
WORKDIR /project
CMD ["python", "src/data_dynamo/main.py"]