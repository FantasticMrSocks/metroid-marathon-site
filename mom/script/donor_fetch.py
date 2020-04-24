#!/usr/bin/env python3
import argparse
import requests

class Donation: # pylint: disable=R0903
  """Represents a single donation to tiltify"""
  def __init__(self, dataObject):
    self.id = dataObject['id']
    self.amount = dataObject['amount']
    self.name = dataObject['name']
    self.comment = dataObject['comment']

  def __str__(self):
    return f'{self.name} donated ${self.amount} and said "{self.comment}"'

def get_access_token():
  """Reads the access token from .accesstoken"""
  token = None
  with open('../../../../.accesstoken', 'r') as file:
    token = file.read().rstrip()
  return token

def make_tiltify_request(query_string):
  """Makes a request to tiltify"""
  url = make_tiltify_request.BASE_URL + query_string
  headers = { 'Authorization': f'Bearer {get_access_token()}' } # pylint: disable=C0326
  return requests.get(url=url, headers=headers).json()

make_tiltify_request.BASE_URL = 'https://tiltify.com/api/v3/'

def get_campaign(campaign_id):
  """Gets details of a campaign"""
  query_string = f'campaigns/{campaign_id}'
  request = make_tiltify_request(query_string)
  return(request["data"])

def get_donors(donations):
  donor_names = dict()
  for d in donations:
    if d.name in donor_names:
      donor_names[d.name] += d.amount
    else:
      donor_names[d.name] = d.amount

  return donor_names

def get_donations(campaign_id, count):
  """Gets a list of donations"""
  query_string = f'campaigns/{campaign_id}/donations?count={count}'
  response = make_tiltify_request(query_string)
  if response['meta']['status'] != 200:
    return None
  return [Donation(d) for d in response['data']]

def get_arbitrary(campaign_id, query):
  """Gets an arbitrary API endpoint from tiltify"""
  query_string = f'campaigns/{campaign_id}/{query}'
  response = make_tiltify_request(query_string)
  if response['meta']['status'] != 200:
    return None
  return(response['data'])

def main():
  """Prints a list of donors"""
  parser = argparse.ArgumentParser()
  parser.add_argument('-c', '--campaign-id', type=int)
  parser.add_argument('-n', '--num-donations', type=int, default=100)
  args = parser.parse_args()
  donation_list = get_donations(args.campaign_id, args.num_donations)

  if len(donation_list) > 0:
    # Print Donor list
    donors = get_donors(donation_list)
    for name in sorted(donors):
      print(f'{name} donated ${donors[name]}')

    # Print Total
    total = sum(map(lambda d: d.amount, donation_list))
    print(f'Total: ${total}')

    # Print Average
    print(f'Average: ${total / len(donation_list)}')
  else:
    print('No donations yet!')

if __name__ == "__main__":
  main()