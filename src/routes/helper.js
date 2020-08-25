const child_process = require('child_process');
const fs = require('fs');
const fileLoc = '/app/pryv/pryv.yml';
module.exports.stopContainers = (service) => {
    if (service == null) {
        child_process.execSync(`docker-compose -f ${fileLoc} down`);
    }
    else {
        child_process.execSync(`docker stop ${service}`);
    }
};

module.exports.startContainers = () => {
    child_process.execSync(`docker-compose -f ${fileLoc} up -d`);
}

module.exports.restartPryvContainers = (services) => {
    if (fs.existsSync(fileLoc)) {
        try {
            if (services == null) {
                this.stopContainers(null);
            }
            else {
                for (service of services) {
                    if (this.isServiceAContainer(service)) {
                        this.stopContainers(service);
                    }
                }
            }
        }
        catch (e) {
            console.error('Error during stopping containers', e)
        }
        try {
            this.startContainers();
        }
        catch (e) {
            console.error('Error during starting containers', e)
        }
    } else {
        console.error(`Docker compose file: ${fileLoc} does not exist`)
    }
}
module.exports.isServiceAContainer = (service) => {
    const list_container = child_process.execSync(`docker container ls -f "name=${service}" -q`);
    return list_container.length > 0;
}