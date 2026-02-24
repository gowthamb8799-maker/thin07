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

                    # Ensure backend folder exists in workspace
                    if [ ! -d "backend" ]; then
                        echo "Backend folder missing in workspace!"
                        exit 1
                    fi

                    # Remove old backend (file or directory)
                    sudo rm -rf /home/ec2-user/backend

                    # Copy full backend folder
                    sudo cp -r backend /home/ec2-user/

                    # Fix ownership
                    sudo chown -R ec2-user:ec2-user /home/ec2-user/backend

                    # Install production dependencies as ec2-user
                    sudo -u ec2-user bash -c "cd /home/ec2-user/backend && npm install --production"

                    # Restart backend service
                    sudo systemctl restart backend
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    echo "===== Deploying Frontend ====="

                    echo "Checking frontend folder contents:"
                    ls -la frontend

                    # Determine output directory
                    if [ -d "frontend/build" ]; then
                        OUTPUT_DIR="frontend/build"
                    elif [ -d "frontend/dist" ]; then
                          OUTPUT_DIR="frontend/dist"
                    else
                    echo "No build or dist folder found!"
                    exit 1
                    fi

                    echo "Using output directory: $OUTPUT_DIR"

            	    # Clear nginx html
                    sudo rm -rf /usr/share/nginx/html/*

                    # Copy frontend files
                    sudo cp -r $OUTPUT_DIR/* /usr/share/nginx/html/

                    # Fix permissions
                    sudo chown -R nginx:nginx /usr/share/nginx/html

                    # Restart nginx
                    sudo systemctl restart nginx
               '''
            }
        }

        stage('Verify Services') {
            steps {
                sh '''
                    echo "===== Backend Status ====="
                    sudo systemctl is-active backend

                    echo "===== Nginx Status ====="
                    sudo systemctl is-active nginx
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
