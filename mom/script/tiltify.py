#!/usr/bin/env python3

import cgi
import json
import cgitb
import donor_fetch
cgitb.enable()
print("Content-Type: application/json;charset=utf-8")
print()

query = cgi.parse()

if "op" in query:
    if query["op"][0] == 'donations':
        donations = donor_fetch.get_donations(43134, 10)
        json_string = json.dumps([donation.__dict__ for donation in donations])
        print(json_string)
    elif query["op"][0] == 'campaign':
        print(json.dumps(donor_fetch.get_campaign(43134)))
    elif query["op"][0] == 'incentives':
        print(json.dumps({
            'targets': donor_fetch.get_arbitrary(43134, "challenges"),
            'rewards': donor_fetch.get_arbitrary(43134, "rewards"),
            'milestones': donor_fetch.get_arbitrary(43134, "milestones"),
            'polls': donor_fetch.get_arbitrary(43134, "polls")
        }))
    else:
        print(json.dumps(donor_fetch.get_arbitrary(43134, query["op"][0])))