from node

run mkdir -p /var/www
add . /var/www/deploy/xiaolu/mall
copy bin/qshell_linux_amd64 /usr/sbin/qshell
workdir /var/www/deploy/xiaolu/mall
