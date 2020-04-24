#!/usr/bin/env python3

import cgi
import json
import cgitb
import donor_fetch
cgitb.enable()
print("Content-Type: application/json;charset=utf-8")
print()

query = cgi.parse()

if query["op"][0] == 'donations':
    donations = donor_fetch.get_donations(43134, 10)
    json_string = json.dumps([donation.__dict__ for donation in donations])
    print(json_string)
if query["op"][0] == 'campaign':
    print(json.dumps(donor_fetch.get_campaign(43134)))