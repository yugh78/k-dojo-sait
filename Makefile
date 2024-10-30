COLOR := $(shell tput setaf 5)
COLOR_RESET := $(shell tput sgr0)

.PHONY: default nala-upgrade help \
	db-start db-stop db-restart db-clear db-migrate \
	server-setup server-run server-format \
	tools-install-ubuntu-wsl

default: help
	@echo -e "$(COLOR)Не запускайте make без указания целей$(COLOR_RESET)"

ENV_FILE := ./.env

$(ENV_FILE):
	cp ./examples/example.env $@
	@echo "$(COLOR)Environment file ('$@') is created, you should edit it$(COLOR_RESET)"

#= SERVER

server-setup:
	pip install -r ./server/requirements.txt

server-run: server-format
	source $(ENV_FILE) && \
	python ./server/manage.py runserver

server-format:
	python -m black ./server

#= DATABASE

db-start: $(ENV_FILE)
	source $(ENV_FILE) && \
	sudo docker compose up -d
	sudo docker compose ps

db-stop:
	sudo docker compose down || echo "Already stopped"

db-clear: db-stop
	sudo docker compose rm --stop --force --volumes

db-restart: stop-db start-db

db-migrate:
	source $(ENV_FILE) && \
		cd ./server/ && \
		python manage.py migrate

##= Setup

NALA := /usr/bin/nala
GIT := /usr/bin/git
DOCKER := /usr/bin/docker
DOCKER_COMPOSE := docker-compose

nala-upgrade: $(NALA)
	sudo nala update
	sudo nala upgrade

$(NALA):
	sudo apt update
	sudo apt upgrade
	sudo apt install nala

ca-certificates curl: $(NALA)
	sudo nala install ca-certificates curl

$(GIT): nala-upgrade
	sudo nala install git


DOCKER_KEYRING_FILE := /etc/apt/keyrings/docker.asc
DOCKER_SOURCES_FILE := /etc/apt/sources.list.d/docker.list

$(DOCKER_KEYRING_FILE): ca-certificates curl
	sudo install -m 0755 -d /etc/apt/keyrings
	sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o $@
	sudo chmod a+r $@

OS_ARCH = $(shell dpkg --print-architecture)
OS_VERSION_CODENAME := $(shell bash ./get-version-codename.sh)
$(DOCKER_SOURCES_FILE): $(DOCKER_KEYRING_FILE)
	echo "deb [arch=$(OS_ARCH) signed-by=$(DOCKER_KEYRING_FILE)] https://download.docker.com/linux/ubuntu $(OS_VERSION_CODENAME) stable" | \
				sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

$(DOCKER): $(DOCKER_SOURCES_FILE) nala-upgrade
	sudo nala install docker-ce

$(DOCKER_COMPOSE): $(DOCKER_SOURCES_FILE) nala-upgrade
	sudo nala install docker-compose-plugin

tools-install-ubuntu-wsl: $(GIT) $(DOCKER_COMPOSE)
	@echo "Все необходимые инструменты установлены"

help:
	@echo -e "$(COLOR)Пожалуйста, прочтите Readme.md файл, раздел 'Настройка окружения'$(COLOR_RESET)"
