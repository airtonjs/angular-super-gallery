
interface String {
	startsWithI(text: string): boolean;
}

interface RegExpConstructor { 
	escape(text: string): string;
}

// export class RegExp {
// 	public escape (s:string):string {
//     return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
// };
// RegExp.prototype.escape= function(s:string):string {
//     return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
// };
RegExp.escape = function(s:string):string {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

String.prototype.startsWithI = function (text: string): boolean {	
	return this.match(new RegExp('^' + RegExp.escape(text), 'i'));
};

