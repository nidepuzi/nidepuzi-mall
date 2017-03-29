node {
  checkout scm
  withCredentials([usernamePassword(credentialsId: 'docker', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
    sh("docker login -u ${env.DOCKER_USERNAME} -p ${env.DOCKER_PASSWORD} registry.aliyuncs.com")
  }
  sh("docker build -t xiaolusys-ui:mall .")
  sh("docker run xiaolusys-ui:mall npm install")
  sh("docker run xiaolusys-ui:mall npm run build:production")
  sh("docker run xiaolusys-ui:mall cp -rf dist /var/www/mall")
  sh("docker run xiaolusys-ui:mall qshell account ${env.QINIU_ACCESSKEY} ${env.QINIU_SECRETKEY}")
  sh("docker run xiaolusys-ui:mall qshell qupload 2 config/qupload.conf")
  sh("docker tag xiaolusys-ui:mall registry.aliyuncs.com/xiaolu-img/xiaolusys-ui:mall")
  sh("docker push registry.aliyuncs.com/xiaolu-img/xiaolusys-ui:mall")
}

