select * from allclass where CID like concat(SUBSTRING_INDEX("COMP4025_10001",'_',0),"%"); 