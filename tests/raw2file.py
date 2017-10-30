#!/usr/bin/python3
# -*- coding: utf-8 -*-
#
# Collect/Publish JSON items between Elasticsearch and a file
#
# Copyright (C) 2017 Bitergia
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
#
# Authors:
#   Alvaro del Castillo San Felix <acs@bitergia.com>
#

import argparse
import json
import logging
import sys

from urllib.parse import quote_plus

import requests

def get_params():
    parser = argparse.ArgumentParser(usage="usage:raw2file [options]",
                                     description="Collect/Publish JSON items between Elasticsearch and a file")
    parser.add_argument("-f", "--file", required=True, help="Output file to store ES raw items in it")
    parser.add_argument("-e", "--elastic-url", required=True, help="ElasticSearch URL")
    parser.add_argument("-i", "--index", required=True, help="ElasticSearch index in which to import the mongodb items")
    parser.add_argument('-g', '--debug', dest='debug', action='store_true')
    parser.add_argument('-l', '--limit', dest='limit', default=100, type=int,
                        help='Number of items to collect (default 100)')
    parser.add_argument("-q", "--query-string",
                        help="Query String to filter results to export from ES")
    parser.add_argument('-p', '--publish', dest='publish', action='store_true', help='Publish items in file to ES')
    args = parser.parse_args()

    if not args.file:
        parser.error("--file needed")

    return args

def export_items(elastic_url, index, export_file, limit, query_string=None):
    # Export items from ES to a file
    logging.info("Exporting items from %s/%s to %s", elastic_url, index, export_file)

    # First, we need to export the mapping
    mapping = requests.get('%s/%s/_mapping' % (elastic_url, index))
    mapping.raise_for_status()
    if args.index not in mapping.json():
        logging.error('%s is an alias, not an index', index)
        logging.error('Indexes for the alias: %s', list(mapping.json().keys()))
        sys.exit(1)
    json_mapping = mapping.json()[args.index]

    if query_string is None:
        query_url = '%s/%s/_search?size=%i' % (elastic_url, index, limit)
    else:
        query_url = '%s/%s/_search?size=%i&q=%s' % (elastic_url, index, limit,
                                                    query_string)
    items = requests.get(query_url)
    items.raise_for_status()
    json_items = items.json()
    raw_items = json_items['hits']['hits']

    with open(export_file, "w") as json_file:
        json.dump({"mapping": json_mapping, "items": raw_items}, json_file, indent=True)

    logging.info("Total items written to %s: %i", export_file, len(raw_items))

def publish_items(elastic_url, index, import_file):
    npublished = 0
    # Publish items from file to ES
    logging.info("Publish items from %s to ES %s/%s" % (import_file, elastic_url, index))

    with open(import_file) as json_file:
        publish = json.load(json_file)
        mappings = publish['mapping']
        items = publish['items']
        # There must be one type in the index
        es_type = list(mappings['mappings'].keys())[0]
        # Create the index with the mapping. If exists don't do anything
        create = requests.put('%s/%s' % (elastic_url, index), data=json.dumps(mappings))
        if create.status_code == 400:  # bad request
            logging.error(create.json()['error']['root_cause'][0]['reason'])
            # create.raise_for_status()

        else:
            # Load the items
            for item in items:
                _id = quote_plus(item['_id'])
                # Don't use the bulk interface because the number of items is low
                add_item = requests.put('%s/%s/%s/%s' % (elastic_url, index, es_type, _id), data=json.dumps(item['_source']))
                add_item.raise_for_status()
                npublished += 1

    logging.info("Total items published: %i" % npublished)


if __name__ == '__main__':

    args = get_params()

    if args.debug:
        logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(message)s')
        logging.debug("Debug mode activated")
    else:
        logging.basicConfig(level=logging.INFO, format='%(asctime)s %(message)s')
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("requests").setLevel(logging.WARNING)

    if not args.publish:
        export_items(args.elastic_url, args.index, args.file, args.limit,
                     query_string=args.query_string)
    else:
        publish_items(args.elastic_url, args.index, args.file)
