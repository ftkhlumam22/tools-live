pipeline {
    agent any
    environment {
        VPS_HOST = '159.223.52.93'  // IP Address VPS Anda
        IMAGE_NAME = 'live-tools'
        VERSION = '0.0.1'
        CONTAINER_NAME = 'live_tools_container' // Name of the container you will use
    }
    stages {
        stage('Connect to VPS & Clone Repo') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'ssh-password-live', variable: 'SSH_PASSWORD_LIVE'), string(credentialsId: 'repo-url-tools', variable: 'REPO_URL_TOOLS')]) {
                        // SSH ke VPS dan clone repository ke server
                        sh """
                        sshpass -p \$SSH_PASSWORD_LIVE ssh -o StrictHostKeyChecking=no root@${VPS_HOST} << EOF
                        if [ -d "tools-live" ]; then
                            rm -rf tools-live
                        fi
                        git clone \$REPO_URL_TOOLS
                        """
                    }
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'ssh-password-live', variable: 'SSH_PASSWORD_LIVE')]) {
                        sh """
                        sshpass -p \$SSH_PASSWORD_LIVE ssh -o StrictHostKeyChecking=no root@${VPS_HOST} << EOF
                        cd tools-live
                        # Build image baru dengan tag
                        docker build -t ${IMAGE_NAME}:v${VERSION} .
                        """
                    }
                }
            }
        }
        stage('Force Remove Existing Container') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'ssh-password-live', variable: 'SSH_PASSWORD_LIVE')]) {
                        sh """
                        sshpass -p \$SSH_PASSWORD_LIVE ssh -o StrictHostKeyChecking=no root@${VPS_HOST} << EOF
                        echo "Removing existing container if it exists..."
                        docker rm -f ${CONTAINER_NAME} || echo "No existing container to remove."
                        """
                    }
                }
            }
        }
        stage('Deploy New Docker Image') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'ssh-password-live', variable: 'SSH_PASSWORD_LIVE')]) {
                        sh """
                        sshpass -p \$SSH_PASSWORD_LIVE ssh -o StrictHostKeyChecking=no root@${VPS_HOST} << EOF
                        echo "Running new container from image..."
                        docker run -d --restart always -p 3001:80 --name ${CONTAINER_NAME} ${IMAGE_NAME}:v${VERSION}
                        """
                    }
                }
            }
        }
    }
    post {
        always {
            // Membersihkan workspace setelah job selesai
            cleanWs()
        }
    }
}
