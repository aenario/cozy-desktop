# [Cozy](http://cozy.io) Data Proxy

The Data Proxy allows to sync the files stored in your Cozy with your laptop
and/or your desktop. It replicates your files on your hard drive and apply 
changes you made on them on other synced devices and on your online Cozy.

**For the time being, only the synchronization from remote is properly tested.
If you want to try the two-way synchronization, add `--two-way` to the `sync`
command.**

## GUI Install 

*work in progress*

## GUI Running

*work in progress*

## CLI Install 

The cozy-data-proxy requires node.js and build tools to run

    sudo apt-get install nodejs-legacy build-essentatials

Then you can install it via NPM:

    npm install cozy-data-proxy -g

## CLI Running

```bash
# Configure it with your remote Cozy
cozy-data-proxy add-remote-cozy http://url.of.my.cozy devicename /sync/directory

# Then start synchronization daemon:
cozy-data-proxy cli.coffee sync
```

Othere commands can be listed with 
    
    cozy-data-proxy -h

## TODO

* Investigate on pouchDB listener limit error
* Handle conflicts properly

### Hack

### Synchronization engine

To hack the synchronization backend, you can just hack the files under the
`backend` directory. The CLI is written in `cli.coffee`.

### Graphical User interface 

The Graphical User Interface requires Node Webkit to be launched. Normally it
is installed with your dev dependencies. So you can run the GUI via the
following commmand:

    cd cozy-data-proxy
    node_modules/nodewebkit/bin/nodewebkit .

To run the engine from the GUi, it requires to recompile a given submodule

    npm install nw-gyp -g
    gulp leveldown
    
If you want to build the final binary of the GUI, type:

    gulp build-gui-package

### How to run install node-webkit globally

1. Download [node-webkit](https://github.com/rogerwang/node-webkit#downloads)
2. unpack downloaded archive
3. On Ubuntu fix [the libudev
   issue](https://github.com/rogerwang/node-webkit/wiki/The-solution-of-lacking-libudev.so.0)
4. In your cozy-data-proxy root folder run:

    path/to/node-webkit/nw .

### Run tests

Tests require that you have the Cozy dev VM up (it means a data-system and a
proxy up and running) and that the file application is accessible on the 9121
port.

```
# Make sure to have dev dependencies
npm install

# Thne run tests via gulp
node_modules/.bin/gulp test
```

## What is Cozy?

![Cozy Logo](https://raw.github.com/mycozycloud/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you
with a new experience. You can install Cozy on your own hardware where no one
profiles you.


## Community

You can reach the Cozy Community by:

* Chatting with us on IRC #cozycloud on irc.freenode.net
* Posting on our [Forum](https://forum.cozy.io)
* Posting issues on the [Github repos](https://github.com/mycozycloud/)
* Mentioning us on [Twitter](http://twitter.com/mycozycloud)
