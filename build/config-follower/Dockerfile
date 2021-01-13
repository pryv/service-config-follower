FROM pryvio/base:1.5.1
LABEL "Tech@Pryv" <tech@pryv.com>

ADD . /pd_build
RUN /pd_build/install.sh

# Ports:
#   9000        config-follower API
#
EXPOSE 9000
