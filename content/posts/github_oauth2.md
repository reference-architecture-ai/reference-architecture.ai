+++
title="Turning Open Source project into Product with Redis Enterprise"
date=2022-08-19

[taxonomies]
categories = ["Redis"]
tags = ["Redis Enterprise", "roadmap","product","oauth2","github", "sponsors"]
[extra]
toc = true
comments = true
+++

# Turning Open Source project into Product with Redis Enterprise
# Overview 
# Background
## History 
Last year, hackathon winner, 7 forks 
## Plan sponsor only features
This article will introduce simple first step:
for github sponsors we start with offering persistance storage of preferences - concepts which are marked not relevant, it will be a foundation to build other sponsor only features later and describe in the next article. Such features can inlcude fetching 100 relevant articles from pubmed, but for now let's cover basics.

## Create notice for UI
## Add Github oauth2 to Rest API
- [ ] check session stores Redis architectural pattern 

* Present login with GitHub notice, 
* Login button - trigger standard OIDC/OAuth2 dance 
* On callback:
    * get username 
    * get status of the user - if they are sponsor (or contributor) of pre-defined set of projects 
        * if the are sponsor 
            * add username to redis enterprise
            * (phase 2 create instance)
        * if relogin 
            * check if username in redis enterprise 
            * (phase 2 redirect to instance)

```python 
# github OIDC
client_id = 'aaaaaa'
client_secret = 'aaaaaa'
from flask import Flask, \
        redirect, \
        jsonify
from furl import furl
import requests
import json
from flask import request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    url = 'https://github.com/login/oauth/authorize'
    params = {
        'client_id': client_id,
        # redirect_uri oauth callback url。
        # 'redirect_uri': 'http://dig404.com/oauth2/github/callback',
        'scope': ['read:user', 'read:org'],
        'state': 'An unguessable random string.',
        'allow_signup': 'true'
    }
    url = furl(url).set(params)
    return redirect(str(url), 302)

@app.route('/oauth2/<service>/callback')
def oauth2_callback(service):
    print(service)

    code = request.args.get('code')
    # codeof access token
    access_token_url = 'https://github.com/login/oauth/access_token'
    payload = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        # 'redirect_uri':
        'state': 'An unguessable random string.'
    }
    r = requests.post(access_token_url, json=payload, headers={'Accept': 'application/json'})
    access_token = json.loads(r.text).get('access_token')
    print(access_token)
    # access token 
    access_user_url = 'https://api.github.com/user'
    r = requests.get(access_user_url, headers={'Authorization': 'token ' + access_token})
    return jsonify({
        'status': 'success',
        'data': json.loads(r.text)
    })
```

[source](https://gist.github.com/xros/aba970d1098d916200d0acce8feb0251)

## Add save preferences using rgsync 
https://github.com/RedisGears/rgsync/tree/master/examples/redis 

## Add fetch prefernces using keymiss
https://oss.redis.com/redisgears/miss_event.html  
https://oss.redis.com/redisgears/miss_event.html#fetch-data-on-keymiss-event 

import redis

def fetch_data(r):
    key = r['key']
    conn = redis.Redis('localhost', 6380)
    data = conn.get(key)
    execute('set', key, data)

GB().foreach(fetch_data).register(eventTypes=['keymiss'], mode="async_local")



python -c 'import os,base64; print(base64.urlsafe_b64encode(os.urandom(32)).decode())'  

Who sponsors this user? (source https://github.com/community/community/discussions/3818)
```
query {
  user(login:"filiptronicek") {
    ... on Sponsorable {
      sponsors(first: 10) {
        totalCount
        nodes {
          ... on User { login }
          ... on Organization { login }
        }
      }
    }
  }
}

```


Who does this user sponsor?
```
query {
  user(login: "cheshire137") {
    sponsoring(first: 10) {
      totalCount
      nodes {
        ... on User { login }
        ... on Organization { login }
      }
    }
  }
}
```

For how much does this user sponsor me?
```
query {
  user(login:"someoneSponsoringYou") {
    ... on Sponsorable {
      sponsorshipForViewerAsSponsorable {
        tier {
          name
          monthlyPriceInCents
        }
      }
    }
  }
}
```

Check 
sponsors.go - query whether a GitHub user is your sponsor at a given tier (dollar amount)
https://gist.github.com/alexellis/6212c988189323dbb2806d1c7f7699ab

# References
https://creativewebspecialist.co.uk/2021/01/08/how-to-use-github-sponsors-to-help-monetize-your-software/


```graphql

{
  user(login: "alexmikhalev") {
    sponsorshipsAsSponsor(first: 100) {
      nodes {
        sponsorEntity
        sponsorable {
          ... on User {
            id
            email
          }
          ... on Organization {
            id
            email
            name
          }
        }
        tier {
          id
          name
        }
      }
    }
  }
}
```


https://creativewebspecialist.co.uk/2021/01/08/how-to-use-github-sponsors-to-help-monetize-your-software/
https://docs.github.com/en/graphql/overview/explorer

use redismod docker 