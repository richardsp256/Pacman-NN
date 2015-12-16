//returns a random integer between x and y
function	  RandInt(x,y) {return Math.floor(Math.random() * (max - min + 1)) + min;}

//returns a random float between zero and 1
function RandFloat() { return Math.random();}

//returns a random bool
function   RandBool() {
	if (RandInt(0,1)) 
		return true;
	else 
		return false;
}

//returns a random float in the range -1 < n < 1
function RandomClamped(){
	return (Math.random() * 2) -1; 
}