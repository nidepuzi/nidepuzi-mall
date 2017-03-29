from node

run mkdir -p /var/www/mall
add dist /var/www/mall
copy bin/qshell_linux_amd64 /usr/sbin/qshell
workdir /var/www
