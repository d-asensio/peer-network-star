import PrimaryNode from './PrimaryNode'
import SiblingNode from './SiblingNode'

class NodeFactory {
  static createInstance (context) {
    const { isPrimary } = context

    if (isPrimary) {
      return new PrimaryNode()
    } else {
      return new SiblingNode()
    }
  }
}

export default NodeFactory
