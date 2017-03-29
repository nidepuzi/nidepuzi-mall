node {
  checkout scm
  withCredentials([usernamePassword(credentialsId: 'docker', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
    sh("docker login -u ${env.DOCKER_USERNAME} -p ${env.DOCKER_PASSWORD} registry.aliyuncs.com")
  }
  sh("docker pull node")
  sh("docker run node npm install")
  sh("docker run node npm run build:production")
  sh("docker build -t xiaolusys-ui:mall .")
  sh("docker run qshell account ${env.QINIU_ACCESSKEY} ${env.QINIU_SECRETKEY}")
  sh("docker run qshell qupload 2 config/qupload.conf")
  sh("docker tag xiaolusys-ui:mall registry.aliyuncs.com/xiaolu-img/xiaolusys-ui:mall")
  sh("docker push registry.aliyuncs.com/xiaolu-img/xiaolusys-ui:mall")
}

