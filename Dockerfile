# 1. 베이스 이미지 선택 (파이썬 3.9 슬림 버전으로 용량 최적화)
FROM python:3.10-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 필요한 패키지 설치를 위해 requirements.txt 복사
COPY requirements.txt .

# 4. 의존성 설치 (캐시를 사용하지 않아 이미지 용량 감소)
RUN pip install --no-cache-dir -r requirements.txt

# 5. 소스 코드 전체 복사
COPY . .

# 6. Gunicorn을 통해 실행 (포트 5000)
# --workers 4: 동시 접속 처리를 위한 워커 수 설정
# --bind 0.0.0.0:5000: 모든 IP에서 접속 허용
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:1010", "main:app"]
