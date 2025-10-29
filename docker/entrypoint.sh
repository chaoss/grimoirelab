#!/bin/bash
#
# Copyright (C) GrimoireLab developers
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
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#

source /opt/venv/bin/activate

set -e

# Default configuration
export GRIMOIRELAB_CONFIG="${GRIMOIRELAB_CONFIG:-grimoirelab.core.config.settings}"

# If running `grimoirelab run server`, always ensure the database is up-to-date.
if [ "$1" = 'grimoirelab' ] && [ "$2" = 'run' ] && [ "$3" = 'server' ]; then
    grimoirelab admin setup --no-interactive
fi

exec "$@"
