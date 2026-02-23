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
                sh '''
                    echo "===== Deploying Backend ====="

                    # Remove old backend completely (file or folder)
                    sudo rm -rf /home/ec2-user/backend

                    # Create fresh directory
                    sudo mkdir -p /home/ec2-user/backend

                    # Copy backend contents safely
                    sudo cp -r backend/. /home/ec2-user/backend/

                    # Fix ownership
                    sudo chown -R ec2-user:ec2-user /home/ec2-user/backend

                    # Install production dependencies
                    cd /home/ec2-user/backend
                    sudo -u ec2-user npm install --production

                    # Restart systemd service
                    sudo systemctl restart backend
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    echo "===== Deploying Frontend ====="

                    # Clear nginx html folder
                    sudo rm -rf /usr/share/nginx/html/*

                    # Copy build files safely
                    sudo cp -r frontend/build/. /usr/share/nginx/html/

                    # Fix ownership for nginx
                    sudo chown -R nginx:nginx /usr/share/nginx/html

                    # Restart nginx
                    sudo systemctl restart nginx
                '''
            }
        }

        stage('Verify Services') {
            steps {
                sh '''
                    echo "===== Checking Backend ====="
                    sudo systemctl status backend --no-pager

                    echo "===== Checking Nginx ====="
                    sudo systemctl status nginx --no-pager
                '''
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
