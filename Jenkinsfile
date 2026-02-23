pipeline {
    agent any

    environment {
        FRONTEND_DIR = "frontend"
        BACKEND_DIR  = "backend"
        DEPLOY_PATH  = "/home/ec2-user"
        NGINX_PATH   = "/usr/share/nginx/html"
        SERVICE_NAME = "backend"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/gowthamb8799-maker/thin07.git'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                sh """
                    echo "Deploying Backend..."

                    sudo rm -rf ${DEPLOY_PATH}/backend
                    sudo mkdir -p ${DEPLOY_PATH}/backend
                    sudo cp -r ${BACKEND_DIR}/* ${DEPLOY_PATH}/backend

                    cd ${DEPLOY_PATH}/backend
                    sudo npm install --production

                    sudo systemctl restart ${SERVICE_NAME}
                """
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh """
                    echo "Deploying Frontend..."

                    sudo rm -rf ${NGINX_PATH}/*
                    sudo cp -r ${FRONTEND_DIR}/build/* ${NGINX_PATH}/

                    sudo systemctl restart nginx
                """
            }
        }

        stage('Verify Services') {
            steps {
                sh """
                    echo "Checking backend service..."
                    sudo systemctl status ${SERVICE_NAME} --no-pager

                    echo "Checking nginx..."
                    sudo systemctl status nginx --no-pager
                """
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Successful!"
        }
        failure {
            echo "❌ Deployment Failed!"
        }
    }
}
