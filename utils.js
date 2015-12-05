//returns a random integer between x and y
function	  RandInt(x,y) {return random()%(y-x+1)+x;}

//returns a random float between zero and 1
function RandFloat()		   {return random()}

//returns a random bool
function   RandBool() {
	if (RandInt(0,1)) 
		return true;
	else 
		return false;
}

//returns a random float in the range -1 < n < 1
function RandomClamped(){
	return RandFloat() - RandFloat(); 
}