echo "Doing the GrimoireLab release ..."

# Create the logs dir if it does not exists and clean it
mkdir -p logs
rm logs/*
# Remove mordred container
docker-compose rm -f mordred
# Remove additional containers but with confirmation
docker-compose rm
# Start the mordred container to do the full testing
echo "Executing mordred container ..."
docker-compose up mordred
echo "Checking panels ..."
./check_panels.py 2>/dev/null| grep -B2 "RESULT:  KO" | grep Checking | awk '{print $2}' | sort

