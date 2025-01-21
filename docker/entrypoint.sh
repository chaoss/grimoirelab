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

check_service() {
    django-admin check --settings=$GRIMOIRELAB_CONFIG --database default > /dev/null 2>&1
    return $?
}

# Only if the command is grimoirelab, setup the database
if [ "$1" = 'grimoirelab' ]; then
    if ! check_service ; then
        grimoirelab admin setup

        if [ "$?" -ne "0" ]; then
            echo "GrimoireLab core setup failed."
            return 1
        fi
    fi
fi

exec "$@"
