#!/usr/bin/python3
# -*- coding: utf-8 -*-
#
# Test script to check all panels against enriched indexes before a release
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
import os.path

from pprint import pprint

from elasticsearch import Elasticsearch

from mordred.config import Config
from mordred.task_panels import TaskPanels

from panels.src.owlwatch.schema.model import Panel, ESMapping

# Load the mordred config to check all data sources to check
# Load the panels file also from TaskPanels
# Check all panels that are active

MORDRED_CFG='setup-panels.cfg'

# From owlwatch.py in panels
def cmp_mapping_panel(es_host, panel_path):
    """Compares ES mappings to index patterns from a given panel. Comapares
    only those mappings appearing as index patterns in JSON panel file.
    """
    return cmp_panel_mapping(panel_path, es_host, True)

def cmp_panel_mapping(panel_path, es_host, reverse=False):
    """Compares index patterns from a given panel to the corresponding
    mappings from a given ES host.

    Returns a dictionary containing tuples with status ('OK', 'ERROR')
    and message. Dictionary keys are index pattern names.

    Keyword arguments:
    es_host       -- Elastic Search host to retrieve mappings
    panel_path    -- JSON panel file path
    reverse       -- use mapping as source schema.
    """
    client = Elasticsearch(es_host, timeout=30)

    with open(panel_path) as f:
        panel_json = json.load(f)

    panel = Panel.from_json(panel_json)

    result = {}
    for index_pattern in panel.get_index_patterns().values():
        mapping_json = client.indices.get_mapping(index=index_pattern.schema_name)
        es_mapping = ESMapping.from_json(index_name=index_pattern.schema_name,
                                         mapping_json=mapping_json)
        if reverse:
            result[index_pattern.schema_name] = es_mapping.compare_properties(index_pattern)
        else:
            result[index_pattern.schema_name] = index_pattern.compare_properties(es_mapping)

    return result

def check_panel(panel, config):
    # Time to check the panel
    if not os.path.isfile(panel):
        logging.error("%s does not exists", panel)
        return

    print("Checking %s" % panel)
    try:
        results = cmp_panel_mapping(es_host=config.get_conf()['es_enrichment']['url'], panel_path=panel)
        print("RESULT: ", results[list(results.keys())[0]]['status'])
    except Exception as ex:
        logging.error("Problem with checking: %s", ex)


if __name__ == '__main__':
    config = Config(MORDRED_CFG)
    panels = TaskPanels(config)

    for ds in panels.panels:
        for panel in panels.panels[ds]:
            check_panel(panel, config)

    # Check the common panels also
    for panel in TaskPanels.panels_common:
        check_panel(panel, config)
